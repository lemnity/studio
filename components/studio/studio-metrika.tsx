import Script from "next/script";

import { AD_SOURCE_KEY, STUDIO_METRIKA_ID } from "./studio-content";

/**
 * Запоминает источник первого захода в сессии: utm_source/medium/campaign/content/term и yclid.
 * Директ дописывает их в ссылку объявления, посетитель потом ходит по сайту — а в заявку
 * всё равно попадёт, с какой кампании и по какому запросу он пришёл.
 */
const ATTRIBUTION = `(function(){try{var p=new URLSearchParams(location.search),k=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","yclid"],o={},n=0;k.forEach(function(x){var v=p.get(x);if(v){o[x]=v.slice(0,120);n++}});if(n&&!sessionStorage.getItem("${AD_SOURCE_KEY}"))sessionStorage.setItem("${AD_SOURCE_KEY}",JSON.stringify(o))}catch(e){}})();`;

/** Цели на клики по контактам (Telegram, почта, телефон) — для оптимизации Директа по конверсиям. */
const contactGoals = (id: number) =>
  `document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a||!window.ym)return;var h=a.getAttribute("href")||"";if(h.indexOf("t.me/")>-1)ym(${id},"reachGoal","click_tg");else if(h.indexOf("mailto:")===0)ym(${id},"reachGoal","click_email");else if(h.indexOf("tel:")===0)ym(${id},"reachGoal","click_phone")},true);`;

/**
 * Яндекс Метрика: просмотры, вебвизор, карта кликов и цели. Счётчик подключается, только если задан
 * STUDIO_METRIKA_ID; источник визита запоминается всегда — он уходит в заявку в Telegram.
 * Цели: lead (отправлена форма, см. Contact в studio-page.tsx), click_tg, click_email, click_phone.
 */
export function StudioMetrika() {
  const id = STUDIO_METRIKA_ID;
  return (
    <>
      <Script id="ad-source" strategy="afterInteractive">
        {ATTRIBUTION}
      </Script>
      {id ? (
        <>
          {/* lazyOnload: счётчик стартует после события load, когда браузер простаивает, — не тормозит загрузку и заставку. */}
          {/* id не "ym": элемент с id="ym" попадает в window.ym, и заготовка счётчика не создаёт функцию ym. */}
          <Script id="ym-counter" strategy="lazyOnload">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=${id}","ym");ym(${id},"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});${contactGoals(id)}`}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://mc.yandex.ru/watch/${id}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
            </div>
          </noscript>
        </>
      ) : null}
    </>
  );
}
