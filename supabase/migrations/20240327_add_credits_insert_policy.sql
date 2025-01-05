-- Enable inserting own credits
CREATE POLICY "Users can insert their own credits"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);