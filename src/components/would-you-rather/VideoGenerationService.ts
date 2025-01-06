import { supabase } from "@/integrations/supabase/client";

interface VideoData {
  audioUrl: string;
  videoUrl?: string;
  script: string;
}

export const generateVideo = async (
  optionA: string,
  optionB: string,
  voiceId: string,
  userId: string
): Promise<{ videoData: VideoData; project: any }> => {
  console.log(`Generating video for question:`, { optionA, optionB });
  
  const { data: videoData, error: videoError } = await supabase.functions.invoke(
    "generate-would-you-rather",
    {
      body: {
        optionA,
        optionB,
        voiceId,
      },
    }
  );

  if (videoError) throw videoError;

  console.log('Received video data:', videoData);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      title: "Would You Rather Video",
      type: "would_you_rather",
      user_id: userId,
      description: `Would you rather ${optionA} OR ${optionB}?`,
      status: "draft"
    })
    .select()
    .single();

  if (projectError) {
    console.error("Project creation error:", projectError);
    throw projectError;
  }

  if (!project) {
    throw new Error("No project data returned");
  }

  console.log(`Project created successfully:`, project);

  const { error: questionError } = await supabase
    .from("would_you_rather_questions")
    .insert({
      project_id: project.id,
      user_id: userId,
      option_a: optionA,
      option_b: optionB,
    });

  if (questionError) {
    console.error("Question creation error:", questionError);
    throw questionError;
  }

  return { videoData, project };
};