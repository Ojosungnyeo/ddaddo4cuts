import { Mascot } from '../components/Mascot'

export function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen home-screen">
      <div className="home-screen__content">
        <div className="brand" aria-label="따또네컷">
          <Mascot size="home" />
          <span>따또네컷</span>
        </div>
        <button className="primary-button home-screen__button" onClick={onStart}>사진 촬영하기</button>
      </div>
      <small className="copyright">Copyright ⓒ 2026. DDADDO All rights reserved.</small>
    </main>
  )
}
