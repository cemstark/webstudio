export const processSteps = [
  { number: "01", title: "Keşif", text: "Hedefi, kullanıcıyı ve doğru kapsamı netleştiririz." },
  { number: "02", title: "Yön", text: "İçerik yapısını ve görsel yaklaşımı görünür hale getiririz." },
  { number: "03", title: "Üretim", text: "Tasarım ve geliştirmeyi aynı karar çizgisinde ilerletiriz." },
  { number: "04", title: "Yayın", text: "Kalite kontrollerini tamamlar, ürünü yayına hazırlarız." },
] as const;

export function ProcessSteps() {
  return <ol className="processGrid">{processSteps.map((step) => <li key={step.number}><span className="micro">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>;
}
