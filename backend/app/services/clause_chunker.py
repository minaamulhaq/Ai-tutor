import json
import re
from typing import List, Tuple
from app.schemas.protocol import BoardActionPayload


def sanitize_spoken_text(text: str) -> str:
    """
    Removes all Markdown symbols (**, *, #, `, _, ~), leftover brackets, and raw symbol clutter
    so the TTS engine never pronounces 'star star', 'hashtag', or 'backtick'.
    """
    if not text:
        return ""

    # Strip any residual [[...]] tags
    cleaned = re.sub(r"\[\[.*?\]\]", " ", text)
    cleaned = re.sub(r"\[\[.*", " ", cleaned)

    # Convert common math notation to natural speech before stripping symbols
    cleaned = re.sub(r"\^2\b", " squared", cleaned)
    cleaned = re.sub(r"\^3\b", " cubed", cleaned)
    cleaned = cleaned.replace("->", " to ")
    cleaned = cleaned.replace("=>", " leads to ")

    # Remove all asterisks (* and **), hashtags (#), backticks (`), underscores (_), tildes (~), brackets
    cleaned = re.sub(r"[*#`_~\[\]{}\\]+", " ", cleaned)

    # Collapse multiple spaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


class ClauseBoundaryBuffer:
    """
    Implements the 'Clause & Punctuation Boundary Buffer' from the Overlapping Streaming Core Pipeline.
    Extracts inline [[DRAW:...]] and [[ACTION:{...}]] board commands, sanitizes spoken text
    (removing **, *, #, etc.), and pairs actions with the corresponding speakable clause (y_k).
    """

    CLAUSE_PATTERN = re.compile(r"([.,!?;:\n]+)\s+")
    ACTION_JSON_PATTERN = re.compile(r"\[\[ACTION:(\{.*?\})\]\]", re.DOTALL)
    DRAW_TAG_PATTERN = re.compile(r"\[\[DRAW:(.*?)\]\]", re.DOTALL)

    def __init__(self, min_words_per_chunk: int = 4):
        self.buffer: str = ""
        self.min_words = min_words_per_chunk
        self.pending_actions: List[BoardActionPayload] = []
        self.first_chunk_emitted: bool = False

    def _parse_draw_tag(self, raw_inner: str) -> None:
        parts = [p.strip() for p in raw_inner.split("|") if p.strip()]
        if not parts:
            return

        kind = parts[0].lower()

        # 1. Clear / Reset Board: [[DRAW:clear]]
        if kind in ("clear", "reset", "clear_board"):
            self.pending_actions.append(BoardActionPayload(action="clear_board"))
            return

        # Pop trailing hex color if present (e.g. #f97316, #38bdf8, #10b981)
        explicit_color = None
        if len(parts) > 1 and re.match(r"^#[0-9a-fA-F]{3,8}$", parts[-1]):
            explicit_color = parts.pop()

        content_parts = parts[1:]

        # 2. Complete Topic Title Banner: [[DRAW:title|Complete Topic Title|Optional Subtitle or Subject|#f97316]]
        if kind in ("title", "topic", "header", "add_title"):
            title_val = content_parts[0] if len(content_parts) >= 1 else "Lesson Topic"
            sub_val = " — ".join(content_parts[1:]) if len(content_parts) >= 2 else ""
            if not sub_val and ":" in title_val:
                split_t = [s.strip() for s in title_val.split(":", 1)]
                if len(split_t) == 2 and len(split_t[0]) >= 3:
                    title_val, sub_val = split_t[0], split_t[1]
            self.pending_actions.append(
                BoardActionPayload(
                    action="add_title",
                    title=title_val,
                    text=sub_val,
                    color=explicit_color or "#f97316",
                )
            )
            return

        # 3. Topic Definition Card: [[DRAW:definition|Proper Topic Being Defined|Clear complete definition|#38bdf8]]
        if kind in ("definition", "define", "def", "add_definition"):
            if len(content_parts) >= 2:
                topic_name = content_parts[0]
                def_body = " — ".join(content_parts[1:])
            elif len(content_parts) == 1:
                raw_def = content_parts[0]
                if ":" in raw_def:
                    split_d = [s.strip() for s in raw_def.split(":", 1)]
                    topic_name, def_body = split_d[0], split_d[1]
                else:
                    topic_name, def_body = "Key Definition", raw_def
            else:
                return

            self.pending_actions.append(
                BoardActionPayload(
                    action="add_definition",
                    title=topic_name,
                    text=def_body,
                    color=explicit_color or "#38bdf8",
                )
            )
            return

        # 4. Structured Segment / Important Concept Card: [[DRAW:segment|Segment Title|Important explanation|#10b981]]
        if kind in ("segment", "section", "point", "important", "key_point", "add_segment"):
            if len(content_parts) >= 2:
                seg_title = content_parts[0]
                seg_body = " • ".join(content_parts[1:])
            elif len(content_parts) == 1:
                raw_seg = content_parts[0]
                if ":" in raw_seg:
                    split_s = [s.strip() for s in raw_seg.split(":", 1)]
                    seg_title, seg_body = split_s[0], split_s[1]
                else:
                    seg_title, seg_body = "Important Segment", raw_seg
            else:
                return

            self.pending_actions.append(
                BoardActionPayload(
                    action="add_segment",
                    title=seg_title,
                    text=seg_body,
                    color=explicit_color or "#10b981",
                )
            )
            return

        # 4.5 Executable Code Editor File Card: [[DRAW:code|filename.py|line 1\nline 2|#10b981]]
        if kind in ("code", "file", "script", "program", "add_code"):
            if len(content_parts) >= 2:
                file_title = content_parts[0].strip()
                raw_code = "\n".join(content_parts[1:])
            elif len(content_parts) == 1:
                file_title = "example.py"
                raw_code = content_parts[0]
            else:
                return

            # Convert literal \n or ; separators into real multi-line code lines with proper indentation
            formatted_code = (
                raw_code.replace("\\n", "\n")
                .replace("\\t", "    ")
                .strip()
            )
            if "\n" not in formatted_code and ";" in formatted_code:
                formatted_code = "\n".join(
                    [line.strip() for line in formatted_code.split(";") if line.strip()]
                )

            ext = file_title.split(".")[-1].lower() if "." in file_title else "python"
            lang_map = {
                "py": "python",
                "js": "javascript",
                "ts": "typescript",
                "cpp": "cpp",
                "c": "c",
                "java": "java",
                "sql": "sql",
                "html": "html",
            }
            lang = lang_map.get(ext, ext)

            self.pending_actions.append(
                BoardActionPayload(
                    action="add_code",
                    title=file_title,
                    language=lang,
                    text=formatted_code,
                    color=explicit_color or "#10b981",
                )
            )
            return

        # 4.6 Mathematical / Scientific Formula Card: [[DRAW:formula|Formula Name|F = m * a|#a855f7]]
        if kind in ("formula", "equation", "math", "add_formula"):
            if len(content_parts) >= 2:
                form_title = content_parts[0].strip()
                form_body = "\n".join(content_parts[1:]).replace("\\n", "\n").strip()
            elif len(content_parts) == 1:
                form_title = "Key Formula & Expression"
                form_body = content_parts[0].replace("\\n", "\n").strip()
            else:
                return

            self.pending_actions.append(
                BoardActionPayload(
                    action="add_formula",
                    title=form_title,
                    text=form_body,
                    color=explicit_color or "#a855f7",
                )
            )
            return

        # 5. Diagram Generator: [[DRAW:diagram|flowchart|Node 1 -> Node 2 -> Node 3|#f97316]]
        if kind == "diagram":
            dtype_raw = content_parts[0].lower() if len(content_parts) >= 1 else "flowchart"
            if dtype_raw in ("tree", "hierarchy", "mindmap", "branches"):
                dtype = "hierarchy"
            elif dtype_raw in ("cycle", "loop"):
                dtype = "cycle"
            elif dtype_raw in ("comparison", "vs", "compare", "table"):
                dtype = "comparison"
            else:
                dtype = "flowchart"

            nodes_raw = " -> ".join(content_parts[1:]) if len(content_parts) >= 2 else ""
            nodes = [
                n.strip()
                for n in re.split(r"->|;|,", nodes_raw)
                if n.strip()
            ]
            if nodes:
                self.pending_actions.append(
                    BoardActionPayload(
                        action="add_diagram",
                        diagram_type=dtype,  # type: ignore
                        nodes=nodes,
                        color=explicit_color or "#f97316",
                    )
                )
            return

        # 6. Edit existing element: [[DRAW:edit|target_id_or_old_text|New Title|Optional Body|#10b981]]
        if kind in ("edit", "update", "edit_element"):
            target = content_parts[0] if len(content_parts) >= 1 else ""
            new_title = content_parts[1] if len(content_parts) >= 2 else ""
            new_body = " — ".join(content_parts[2:]) if len(content_parts) >= 3 else ""
            if target and (new_title or new_body):
                self.pending_actions.append(
                    BoardActionPayload(
                        action="edit_element",
                        target=target,
                        title=new_title if new_body else None,
                        text=new_body if new_body else new_title,
                        color=explicit_color,
                    )
                )
            return

        # 7. Delete / Remove existing element: [[DRAW:delete|target_id_or_text]]
        if kind in ("delete", "remove", "delete_element"):
            target = content_parts[0] if len(content_parts) >= 1 else ""
            if target:
                self.pending_actions.append(
                    BoardActionPayload(
                        action="delete_element",
                        target=target,
                    )
                )
            return

        # 8. Highlight / Point at existing element: [[DRAW:highlight|target_id_or_text|#f97316]]
        if kind in ("highlight", "point", "focus", "highlight_element"):
            target = content_parts[0] if len(content_parts) >= 1 else ""
            if target:
                self.pending_actions.append(
                    BoardActionPayload(
                        action="highlight_element",
                        target=target,
                        color=explicit_color or "#f97316",
                    )
                )
            return

        # 9. Standard Shapes: box, circle, text, arrow
        if kind in ("box", "add_box", "rectangle"):
            if len(content_parts) >= 2:
                box_title = content_parts[0]
                box_body = " • ".join(content_parts[1:])
            elif len(content_parts) == 1:
                raw_b = content_parts[0]
                if ":" in raw_b:
                    split_b = [s.strip() for s in raw_b.split(":", 1)]
                    box_title, box_body = split_b[0], split_b[1]
                else:
                    box_title, box_body = raw_b, ""
            else:
                box_title, box_body = "Concept", ""

            self.pending_actions.append(
                BoardActionPayload(
                    action="add_box",
                    title=box_title,
                    text=box_body or box_title,
                    color=explicit_color or "#f97316",
                )
            )
        elif kind in ("circle", "ellipse", "node", "add_circle"):
            joined_c = " — ".join(content_parts) if content_parts else "Node"
            self.pending_actions.append(
                BoardActionPayload(
                    action="add_circle",
                    text=joined_c,
                    color=explicit_color or "#10b981",
                )
            )
        elif kind in ("text", "note", "add_text"):
            joined_t = " — ".join(content_parts) if content_parts else "Note"
            self.pending_actions.append(
                BoardActionPayload(
                    action="add_text",
                    text=joined_t,
                    color=explicit_color or "#38bdf8",
                )
            )
        elif kind in ("arrow", "add_arrow"):
            self.pending_actions.append(
                BoardActionPayload(
                    action="add_arrow",
                    color=explicit_color or "#10b981",
                )
            )

    def _extract_tags_from_buffer(self) -> None:
        # 1. Extract [[DRAW:...]] tags
        while True:
            match = self.DRAW_TAG_PATTERN.search(self.buffer)
            if not match:
                break
            self._parse_draw_tag(match.group(1))
            self.buffer = self.buffer[: match.start()] + " " + self.buffer[match.end() :]

        # 2. Extract [[ACTION:{...}]] JSON tags
        while True:
            match = self.ACTION_JSON_PATTERN.search(self.buffer)
            if not match:
                break
            raw_json = match.group(1).strip()
            try:
                parsed = json.loads(raw_json)
                self.pending_actions.append(BoardActionPayload(**parsed))
            except Exception:
                pass
            self.buffer = self.buffer[: match.start()] + " " + self.buffer[match.end() :]

    def feed_token(
        self, token: str
    ) -> List[Tuple[str, List[BoardActionPayload]]]:
        """
        Ingests a streaming token Δw from the LLM and returns a list of
        (sanitized_speakable_clause, associated_board_actions) tuples.
        """
        self.buffer += token
        self._extract_tags_from_buffer()

        ready_pairs: List[Tuple[str, List[BoardActionPayload]]] = []

        # Hold back any incomplete "[[" tag at the end of buffer
        pending_tag_idx = self.buffer.find("[[")
        working_text = (
            self.buffer[:pending_tag_idx]
            if pending_tag_idx != -1
            else self.buffer
        )
        remainder_after_working = (
            self.buffer[pending_tag_idx:] if pending_tag_idx != -1 else ""
        )

        while True:
            match = self.CLAUSE_PATTERN.search(working_text)
            if not match:
                # Micro-chunk the very first utterance if it has >= 5 words and ends with a space
                # so TTS synthesis starts on the earliest tokens without waiting for a full sentence.
                if not self.first_chunk_emitted and working_text.endswith(" "):
                    words = sanitize_spoken_text(working_text).split()
                    if len(words) >= 5:
                        candidate_clause = sanitize_spoken_text(working_text)
                        if candidate_clause:
                            self.first_chunk_emitted = True
                            ready_pairs.append(
                                (candidate_clause, list(self.pending_actions))
                            )
                            self.pending_actions.clear()
                            working_text = ""
                break

            split_end = match.end()
            candidate_clause = sanitize_spoken_text(working_text[:split_end])
            word_count = len(candidate_clause.split())
            effective_min = 2 if not self.first_chunk_emitted else self.min_words

            if word_count >= effective_min or any(
                p in match.group(1) for p in [".", "!", "?", ":", "\n"]
            ):
                if candidate_clause:
                    self.first_chunk_emitted = True
                    ready_pairs.append((candidate_clause, list(self.pending_actions)))
                    self.pending_actions.clear()
                working_text = working_text[split_end:]
            else:
                next_match = self.CLAUSE_PATTERN.search(working_text, split_end)
                if next_match:
                    split_end = next_match.end()
                    candidate_clause = sanitize_spoken_text(working_text[:split_end])
                    if candidate_clause:
                        ready_pairs.append(
                            (candidate_clause, list(self.pending_actions))
                        )
                        self.pending_actions.clear()
                    working_text = working_text[split_end:]
                else:
                    break

        self.buffer = working_text + remainder_after_working
        return ready_pairs

    def flush_remaining(self) -> List[Tuple[str, List[BoardActionPayload]]]:
        """Flushes any remaining text and actions at the end of the LLM stream."""
        self._extract_tags_from_buffer()
        clean = sanitize_spoken_text(self.buffer)
        self.buffer = ""

        if clean or self.pending_actions:
            pair = (clean, list(self.pending_actions))
            self.pending_actions.clear()
            return [pair]
        return []
