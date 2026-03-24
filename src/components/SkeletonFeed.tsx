import { SkeletonTweet } from './SkeletonTweet'

export function SkeletonFeed() {
  return (
    <div className="feed">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonTweet key={i} />
      ))}
    </div>
  )
}
