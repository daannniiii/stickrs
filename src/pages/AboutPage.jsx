export default function AboutPage() {
  return (
    <main className="static-page">
      <div className="static-page-inner">
        <h1>About Us</h1>
        <p>
          Welcome to <strong>Stickr</strong> — your one-stop shop for
          high-quality custom stickers. We design and produce premium stickers
          across all your favourite themes: anime, sports, movies, games, and
          much more.
        </p>
        <p>
          Every sticker is printed on durable, weather-resistant vinyl with
          vibrant colours that last. Browse our catalog, pick your favourites,
          and reach out to place your order!<br/><br/>
          
          <strong>Please note that we only (for now) provide our products in University of Engineering and Technology(UET), Lahore</strong>
          
        </p>

        {/* Instagram Call-to-Action Card */}
        <div className="about-insta-card">
          <div className="about-insta-content">
            <svg
              className="about-insta-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <div>
              <h3>Order Directly on Instagram</h3>
              <p>DM us with your favorite sticker designs or send your custom artwork!</p>
            </div>
          </div>
          <a
            href="https://www.instagram.com/stickr.uet"
            target="_blank"
            rel="noopener noreferrer"
            className="about-insta-btn"
          >
            Visit @stickr.uet ↗
          </a>
        </div>
      </div>
    </main>
  );
}
