export default function ContactPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">
        <h1>Contact Us</h1>
        <p>Have a question or want to place a custom order? Reach out to us!</p>
        <ul className="contact-list">
          <li>
            📧{" "}
            <a href="mailto:hello@stickr.store">hello@stickr.store</a>
          </li>
          <li>📱 WhatsApp: +92-XXX-XXXXXXX</li>
          <li>📍 Lahore, Pakistan</li>
        </ul>
      </div>
    </main>
  );
}
