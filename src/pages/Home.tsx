import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Map, Users, Sparkles } from "lucide-react";

export function Home() {
  return (
    <div className="flex flex-col gap-16 md:gap-24">
      <section className="relative text-center py-20 md:py-32">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#2d3748_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 leading-tight">
          Generate Living Worlds with a Single Spark
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Mneme breathes life into your imagination, creating rich, dynamic
          universes from the simplest of ideas. Your next saga begins here.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/create-new">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating Your Universe
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          The Architect's Toolkit
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-background/50 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center gap-4">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <CardTitle>Infinite Lore Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Leverage state-of-the-art AI to generate detailed histories,
                conflicting factions, unique cultures, and compelling
                characters.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/50 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center gap-4">
              <Map className="h-8 w-8 text-primary" />
              <CardTitle>Dynamic World Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualize your creation with dynamically generated maps,
                timelines, and relationship charts that evolve as you build your
                world.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/50 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Collaborate & Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Invite others to build alongside you. When you're ready, export
                your world for TTRPGs, novels, or any other creative project.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="text-center py-20">
        <h2 className="text-4xl font-bold">Your Next Saga Awaits.</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          What world will you create today?
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link to="/create-new">Begin Your Creation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
