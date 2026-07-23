import type { Faq } from "@/content/faqs";
import { JsonLd } from "@/lib/seo";

export function FaqList({ faqs, includeSchema = false }: { faqs: readonly Faq[]; includeSchema?: boolean }) {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return (
    <>
      {includeSchema && <JsonLd data={schema} />}
      <div className="faqList">
        {faqs.map((faq, index) => (
          <details key={faq.question} open={index === 0}>
            <summary><span>{faq.question}</span><span aria-hidden="true">+</span></summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
