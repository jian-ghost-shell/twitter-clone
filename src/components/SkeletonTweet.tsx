export function SkeletonTweet() {
  return (
    <div className="tweet skeleton-tweet">
      <div className="tweet-avatar skeleton-avatar" />
      <div className="tweet-content">
        <div className="skeleton-header">
          <div className="skeleton-name" />
          <div className="skeleton-time" />
        </div>
        <div className="skeleton-text" />
        <div className="skeleton-text short" />
        <div className="skeleton-actions">
          <div className="skeleton-action" />
          <div className="skeleton-action" />
          <div className="skeleton-action" />
          <div className="skeleton-action" />
        </div>
      </div>
    </div>
  )
}
