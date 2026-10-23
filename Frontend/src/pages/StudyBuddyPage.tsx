import { UsersRound } from "lucide-react";

export default function StudyBuddyPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-8">
        <p className="text-sm font-medium text-accent">Study together</p>
        <h1 className="mt-1 font-serif text-3xl text-primary">Study Buddy</h1>
      </header>

      <div className="rounded-3xl border border-default bg-surface p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated text-accent">
          <UsersRound size={26} strokeWidth={1.8} />
        </div>
        <h2 className="font-serif text-xl text-primary">
          Find your study partner
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
          Study Buddy is coming soon. You’ll be able to connect with other
          students and make studying a shared experience.
        </p>
      </div>
    </section>
  );
}
