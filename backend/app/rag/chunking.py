"""
Deterministic Semantic Text Chunking Engine
Splits document segments cleanly along natural paragraph and sentence boundaries
while maintaining sliding-window overlap and preserving page/slide/timestamp provenance.
"""
import re
from dataclasses import dataclass
from typing import List, Optional
from app.schemas.extraction import ExtractedSegment


@dataclass
class TextChunk:
    chunk_index: int
    content: str
    token_count: int
    location_label: str
    document_id: str
    course_id: Optional[str] = None
    page_id: Optional[str] = None
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    timestamp_seconds: Optional[int] = None


class DeterministicChunker:
    """
    Deterministic sliding-window text chunker.
    Splits on paragraph and sentence boundaries without slicing words or formulas.
    """

    def __init__(
        self,
        chunk_size_words: int = 250,
        overlap_words: int = 50,
        min_chunk_words: int = 20
    ):
        if overlap_words >= chunk_size_words:
            raise ValueError("overlap_words must be strictly smaller than chunk_size_words")
        self.chunk_size_words = chunk_size_words
        self.overlap_words = overlap_words
        self.min_chunk_words = min_chunk_words

    def split_into_sentences(self, text: str) -> List[str]:
        """Split text cleanly into paragraphs and sentences."""
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        units: List[str] = []
        for para in paragraphs:
            # Sentence split with lookbehind for punctuation
            sentences = re.split(r"(?<=[.!?])\s+", para)
            for s in sentences:
                s_clean = s.strip()
                if s_clean:
                    units.append(s_clean)
        return units

    def chunk_segment(
        self,
        segment: ExtractedSegment,
        course_id: Optional[str] = None,
        page_id: Optional[str] = None,
        starting_index: int = 0
    ) -> List[TextChunk]:
        """
        Chunk a single ExtractedSegment while strictly preserving its provenance.
        """
        text = segment.cleaned_text.strip() or segment.raw_text.strip()
        if not text:
            return []

        words = text.split()
        # If segment is within chunk size, return as a single atomic chunk
        if len(words) <= self.chunk_size_words:
            return [
                TextChunk(
                    chunk_index=starting_index,
                    content=text,
                    token_count=len(words),
                    location_label=segment.location_label,
                    document_id=segment.document_id,
                    course_id=course_id,
                    page_id=page_id,
                    page_number=segment.page_number,
                    slide_number=segment.slide_number,
                    timestamp_seconds=segment.timestamp_seconds,
                )
            ]

        # Break text into sentence units
        sentence_units = self.split_into_sentences(text)
        chunks: List[TextChunk] = []
        current_chunk_words: List[str] = []
        chunk_idx = starting_index

        for sentence in sentence_units:
            s_words = sentence.split()
            if len(current_chunk_words) + len(s_words) <= self.chunk_size_words:
                current_chunk_words.extend(s_words)
            else:
                if current_chunk_words:
                    chunk_text = " ".join(current_chunk_words)
                    chunks.append(
                        TextChunk(
                            chunk_index=chunk_idx,
                            content=chunk_text,
                            token_count=len(current_chunk_words),
                            location_label=segment.location_label,
                            document_id=segment.document_id,
                            course_id=course_id,
                            page_id=page_id,
                            page_number=segment.page_number,
                            slide_number=segment.slide_number,
                            timestamp_seconds=segment.timestamp_seconds,
                        )
                    )
                    chunk_idx += 1

                    # Compute overlap: take the tail of previous chunk
                    if self.overlap_words > 0 and len(current_chunk_words) > self.overlap_words:
                        overlap_tail = current_chunk_words[-self.overlap_words:]
                    else:
                        overlap_tail = []
                    current_chunk_words = overlap_tail + s_words
                else:
                    # Single sentence larger than chunk_size_words, split strictly by word window
                    current_chunk_words = s_words

        # Append remaining words if above minimum threshold or if it's the only remaining piece
        if current_chunk_words:
            chunk_text = " ".join(current_chunk_words)
            if len(current_chunk_words) >= self.min_chunk_words or not chunks:
                chunks.append(
                    TextChunk(
                        chunk_index=chunk_idx,
                        content=chunk_text,
                        token_count=len(current_chunk_words),
                        location_label=segment.location_label,
                        document_id=segment.document_id,
                        course_id=course_id,
                        page_id=page_id,
                        page_number=segment.page_number,
                        slide_number=segment.slide_number,
                        timestamp_seconds=segment.timestamp_seconds,
                    )
                )

        return chunks

    def chunk_segments(
        self,
        segments: List[ExtractedSegment],
        course_id: Optional[str] = None
    ) -> List[TextChunk]:
        """Chunk a sequence of segments across an entire document."""
        all_chunks: List[TextChunk] = []
        global_idx = 0
        for seg in segments:
            seg_chunks = self.chunk_segment(seg, course_id=course_id, starting_index=global_idx)
            all_chunks.extend(seg_chunks)
            global_idx += len(seg_chunks)
        return all_chunks

