ALTER TABLE public.wishes ALTER COLUMN note_image_url DROP NOT NULL;
ALTER TABLE public.wishes ADD CONSTRAINT wishes_has_content_chk
  CHECK (note_image_url IS NOT NULL OR (transcription IS NOT NULL AND length(trim(transcription)) > 0));