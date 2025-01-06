import { QuizVideoEditor } from "@/components/quiz/QuizVideoEditor";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";

const Quiz = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="lg:block">
          <SidebarHeader className="p-4">
            <img
              src="/logo.png"
              alt="Cynova Logo"
              className="h-8 w-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1 p-6">
          <QuizVideoEditor />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Quiz;