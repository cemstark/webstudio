export const processSteps = [
  { number: "01", title: "Keşif", text: "Hedefi, kullanıcıyı ve doğru kapsamı netleştiririz." },
  { number: "02", title: "Tasarım", text: "İçerik yapısını, UX kararlarını ve görsel yönü görünür hale getiririz." },
  { number: "03", title: "Geliştirme", text: "Onaylanan sistemi performanslı ve erişilebilir bir ürüne dönüştürürüz." },
  { number: "04", title: "Test & Yayın", text: "Kalite kontrollerini tamamlar, ürünü yayına hazırlarız." },
] as const;

export function ProcessSteps() {
  return <ol className="processGrid">{processSteps.map((step) => <li key={step.number}><span className="micro">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>;
}
