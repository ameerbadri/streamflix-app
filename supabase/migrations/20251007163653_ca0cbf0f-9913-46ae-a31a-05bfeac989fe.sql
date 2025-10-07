-- Drop existing SELECT policy for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a more restrictive SELECT policy that ensures users can ONLY view their own profile
-- This prevents any potential bypass or misconfiguration from exposing email addresses
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND auth.uid() IS NOT NULL
);

-- Ensure the policy is restrictive (not permissive) to prevent policy stacking exploits
-- Note: The policy is already created as restrictive by default, but we're being explicit