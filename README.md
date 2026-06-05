# 카드 짝맞추기 게임

두 장씩 카드를 뒤집어 같은 그림을 찾는 간단한 카드 짝맞추기 게임입니다.

## 실행

`index.html` 파일을 브라우저에서 열면 바로 실행됩니다.

## Firebase 설정

Firebase 콘솔에서 웹 앱을 만든 뒤 [src/firebase.js](src/firebase.js)의 `firebaseConfig`에 값을 넣으면 됩니다.
설정값이 비어 있어도 게임은 로컬 모드로 실행됩니다.

## Vercel 배포

GitHub에 올린 뒤 Vercel에서 저장소를 연결하면 정적 사이트로 배포할 수 있습니다.

- Framework Preset: `Other`
- Build Command: 비워두기 또는 `npm run build`
- Output Directory: `.`
