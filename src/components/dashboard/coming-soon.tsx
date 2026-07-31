import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = { title: string; description: string };

/** Shared "coming next" tile used by every Phase 1 stub route. */
export function ComingSoon({ title, description }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
