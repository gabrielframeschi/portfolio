import type { Metadata } from "next";
import Link from "next/link";
import { Intro } from "@/components/intro";
import { PageColumn } from "@/components/page-column";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.notFound.title,
};

export default function NotFound() {
  return (
    <PageColumn>
      <Intro className="enter" linkHome />
      <section className="enter [--enter-index:1]">
        <h1 className="font-medium text-fg">{site.notFound.title}</h1>
        <p>
          <Link href="/" className="hover-strong hover-strong-text">
            {site.notFound.backHome}
          </Link>
        </p>
      </section>
    </PageColumn>
  );
}
