import type { Metadata } from "next";
import "./globals.css";
import "./minecraft.css";
import "./seasons.css";
import "./games.css";
import "./platformer.css";
import "./community.css";
import "./transitions.css";
import PlayerProgress from "@/components/PlayerProgress";
import SheepCompanion from "@/components/SheepCompanion";
import SheepTransitions from "@/components/SheepTransitions";
import WorldAtmosphere from "@/components/WorldAtmosphere";

export const metadata: Metadata = {
  title: "SheepTier — Minecraft Rankings",
  description: "Classements Minecraft communautaires par gamemode."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><PlayerProgress><WorldAtmosphere /><SheepTransitions/>{children}</PlayerProgress><SheepCompanion/></body>
    </html>
  );
}
