/* Desktop uses a phone-sized game viewport, with no extra launcher controls. */
(() => {
  const url=new URL(location.href);
  if(window.self!==window.top || url.searchParams.has('phone') || innerWidth<=860)return;
  window.NICOLINGO_PHONE_HOST=true;
  document.documentElement.classList.add('phone-host');
  const host=document.createElement('main');host.className='desktop-phone-host';
  const frame=document.createElement('iframe');frame.title='Pictlingoのゲーム画面';
  url.searchParams.set('phone','1');frame.src=url.href;
  host.append(frame);document.body.append(host);
})();
