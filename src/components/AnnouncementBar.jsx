export default function AnnouncementBar({
  messages = [
    "Welcome to Stickr — Premium Waterproof Vinyl Stickers!",
    "Custom designs & bulk orders available via Instagram",
    "We only provide these stickers in UET Lahore:)",
    "Feel free to ask any question",
  ],
}) {
  return (
    <div className="ticker-wrap" aria-label="Announcements">
      <div className="ticker-track">
        {/* Render twice for continuous, seamless infinite loop */}
        <div className="ticker-content">
          {messages.map((msg, idx) => (
            <span key={`msg-1-${idx}`} className="ticker-item">
              {msg}
              <span className="ticker-separator">•</span>
            </span>
          ))}
        </div>
        <div className="ticker-content" aria-hidden="true">
          {messages.map((msg, idx) => (
            <span key={`msg-2-${idx}`} className="ticker-item">
              {msg}
              <span className="ticker-separator">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
