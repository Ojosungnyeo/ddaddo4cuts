# 따또네컷 (ddaddo4cuts)

전시용 웹캠 네컷 포토부스 MVP입니다. React, TypeScript, Vite로 만들었고 사진은 브라우저 메모리에만 보관합니다.

## 실행

```bash
npm install
npm run dev
```

표시된 로컬 주소를 Chrome 또는 Safari에서 열고 카메라 사용을 허용하세요. 웹캠 API는 `localhost` 또는 HTTPS에서 동작합니다. 프로덕션 빌드는 `npm run build`로 확인할 수 있습니다.

## 촬영 흐름

시작 → White/Lime/Black 프레임 선택 → 카메라 준비 → 5초 카운트다운과 자동 촬영 4회 → 프레임 합성 결과 화면 순서입니다. Lime은 Neon PNG를 사용합니다. 결과 화면에서 완성된 PNG를 다운로드할 수 있습니다. 처음으로 돌아가면 사진과 프레임 선택이 초기화되고 카메라 스트림도 종료됩니다.

## 프레임 합성

- 프레임 파일은 `public/frames/ddaddo4cuts_white.png`, `ddaddo4cuts_neon.png`, `ddaddo4cuts_black.png`입니다.
- 세 PNG는 모두 1200×3600입니다. 투명 사진 슬롯은 공통으로 x=60, 너비=1080, 높이=720이고 시작 y는 60, 840, 1620, 2400입니다. 이 좌표는 실제 PNG의 알파 채널에서 확인했습니다.
- 프레임 정보는 `src/types.ts`의 `FRAMES`에, 합성 좌표와 Canvas 로직은 `src/utils/composeFourCut.ts`에 있습니다.
- 사진 크롭 비율과 좌우 반전 캡처는 `src/utils/captureFrame.ts`에서 관리합니다.
- 결과 미리보기와 다운로드는 같은 PNG Blob의 Object URL을 사용합니다. 파일명은 다운로드 시 맥북 로컬 시간으로 만듭니다.

전시 시작 전 실제 맥북 웹캠과 행사 브라우저에서 권한 허용, 4회 촬영, 카메라 연결 해제를 확인하세요.
