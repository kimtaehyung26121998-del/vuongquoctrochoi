import fs from 'node:fs'
import path from 'node:path'

// Cảnh vector nguyên gốc, sắc nét ở mọi kích thước; không dùng ảnh bên ngoài.
const output=path.resolve('public/assets/worlds')
fs.mkdirSync(output,{recursive:true})
const gradient=(id,a,b)=>`<linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`
const cloud=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".72"><path d="M-100 20Q-115-10-75-16Q-65-60-23-44Q15-84 48-32Q99-39 110 7Q126 36 72 38H-65Q-103 38-100 20Z"/><path d="M-83 23H81" stroke="#d6f4f7" stroke-width="5" stroke-linecap="round"/></g>`
const tree=(x,y,s=1,color='#126c66')=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0L-16-180H18L10 0" fill="#745c4c"/><path d="M0-60L-50-117M0-90L48-145" stroke="#745c4c" stroke-width="12" stroke-linecap="round"/><path d="M-99-160Q-122-212-62-231Q-50-293 4-266Q63-294 82-230Q146-201 102-153Q128-108 60-108Q10-77-38-108Q-111-105-99-160Z" fill="${color}"/><path d="M-79-188Q-67-223-29-224M-7-244Q34-265 57-228" fill="none" stroke="#b0e9b3" stroke-opacity=".25" stroke-width="13" stroke-linecap="round"/></g>`
const mushroom=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-9 0L-7-33H9L13 0" fill="#fff0cf"/><path d="M-39-31Q-32-87 9-78Q35-75 44-31Q2-15-39-31Z" fill="#f28b92"/><g fill="#ffe8c3"><ellipse cx="-17" cy="-49" rx="8" ry="5" transform="rotate(-27 -17 -49)"/><ellipse cx="14" cy="-61" rx="7" ry="6"/><ellipse cx="31" cy="-40" rx="6" ry="4"/></g></g>`
const palm=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0Q-22-105 8-204" fill="none" stroke="#b77751" stroke-width="20"/><path d="M-6-30L10-35M-9-57L7-62M-7-85L10-88M-3-116L13-120M3-150L18-153" stroke="#e6aa6a" stroke-width="7"/><g fill="#187d6d"><path d="M8-202Q-96-273-134-189Q-57-220 8-202Z"/><path d="M8-202Q-68-323-102-252Q-43-250 8-202Z"/><path d="M8-202Q22-306 78-277Q39-250 8-202Z"/><path d="M8-202Q101-273 143-195Q62-224 8-202Z"/><path d="M8-202Q103-224 106-150Q62-191 8-202Z"/><path d="M8-202Q-78-213-77-146Q-36-188 8-202Z"/></g><g fill="#5fc795"><path d="M8-202Q-72-254-122-198Q-59-230 8-202Z"/><path d="M8-202Q88-252 130-202Q64-233 8-202Z"/><path d="M8-202Q18-275 63-275Q35-244 8-202Z"/></g><circle cx="2" cy="-193" r="11" fill="#ad7655"/><circle cx="20" cy="-190" r="10" fill="#ce8e5f"/></g>`
const stars=Array.from({length:45},(_,i)=>`<circle cx="${(i*137+52)%1600}" cy="${(i*67+40)%430}" r="${i%3===0?2.4:1.2}" fill="#fff5cc" opacity="${.3+(i%5)*.13}"/>`).join('')
const sparkle=(x,y,s=1,color='#ffefb4')=>`<path d="M0-15Q3-3 15 0Q3 3 0 15Q-3 3-15 0Q-3-3 0-15" transform="translate(${x} ${y}) scale(${s})" fill="${color}"/>`
const island=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-160 0L-113 66-44 95 0 153 54 99 124 60 164 0Z" fill="url(#rock)"/><path d="M-113 25L-44 95-20 34M47 20L54 99 91 47" fill="none" stroke="#635d9f" stroke-width="8"/><ellipse rx="164" ry="36" fill="#77c5aa"/><ellipse cy="-8" rx="155" ry="27" fill="#b1e5bb"/><path d="M-114-6Q-20-42 105-11" fill="none" stroke="#e4f7c6" stroke-width="6" stroke-linecap="round"/></g>`
function save(name,defs,body){fs.writeFileSync(path.join(output,name+'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="800" viewBox="0 0 1600 800"><defs>${defs}</defs>${body}</svg>\n`)}

save('forest',gradient('sky','#146d79','#b4e4bd')+gradient('water','#87e8da','#249eae')+gradient('sun','#fff7ce','#f2db9a'),`
<path fill="url(#sky)" d="M0 0H1600V800H0Z"/>
<circle cx="1060" cy="220" r="170" fill="#d9f2c4" opacity=".18"/><circle cx="1060" cy="220" r="112" fill="#e2f5c8" opacity=".3"/><circle cx="1060" cy="220" r="73" fill="url(#sun)"/>
<path d="M780 0H890L480 800H160Z M1140 0H1230L910 800H750Z" fill="#f4ffd2" opacity=".07"/>
${cloud(690,185,1.1)}${cloud(1280,132,.65)}
<path d="M0 380Q130 204 340 334Q544 194 748 354Q963 242 1160 348Q1420 187 1600 307V800H0Z" fill="#358b83"/>
${[50,250,440,1370,1550].map((x,i)=>tree(x,510,[1.2,.85,1.15,1.1,1.4][i],'#257e78')).join('')}
<path d="M0 537Q170 390 386 472Q549 534 694 485Q904 439 1147 486Q1410 411 1600 475V800H0Z" fill="#4aab87"/>
<path d="M808 415Q1030 486 881 563Q729 644 1060 800H411Q639 652 716 566Q827 509 764 415Z" fill="url(#water)"/>
<path d="M789 428Q978 490 837 555M750 598Q671 670 842 724" fill="none" stroke="#d6fff0" stroke-width="7" opacity=".55"/>
<path d="M0 582Q189 501 419 602L446 800H0Z" fill="#236d5b"/><path d="M1600 548Q1438 506 1259 623L1172 800H1600Z" fill="#236d5b"/>
<path d="M0 599Q171 512 402 613M1280 631Q1436 519 1600 569" stroke="#7bd095" stroke-width="19" fill="none"/>
${tree(92,660,1.8,'#165d59')}${tree(1510,684,1.7,'#165d59')}
${mushroom(204,674,1.35)}${mushroom(277,695,.7)}${mushroom(1390,674,.8)}
<g fill="#f7dd91">${[310,370,1220,1280,1450].map((x,i)=>`<circle cx="${x}" cy="${615+i%3*28}" r="4"/>`).join('')}</g>
<path d="M0 773Q185 677 378 775M1271 785Q1455 669 1600 759" fill="none" stroke="#123e46" stroke-width="90"/>
${sparkle(392,237,.7)}${sparkle(1184,340,.5)}${sparkle(578,398,.4)}
`)

save('sky',gradient('sky','#8275c9','#d8d9f5')+gradient('rock','#8f90bb','#544e88'),`
<path fill="url(#sky)" d="M0 0H1600V800H0Z"/>
<circle cx="1210" cy="210" r="143" fill="#cdbce9" opacity=".35"/><circle cx="1210" cy="210" r="91" fill="#ffebcd"/>
<ellipse cx="1210" cy="217" rx="162" ry="26" fill="none" stroke="#f7cbbb" stroke-width="12" transform="rotate(-22 1210 217)"/>
${stars}
<path d="M195 564A590 590 0 0 1 1405 564" fill="none" stroke="#f9b8cc" stroke-width="26" opacity=".2"/><path d="M227 564A558 558 0 0 1 1373 564" fill="none" stroke="#fce3b6" stroke-width="26" opacity=".2"/><path d="M259 564A526 526 0 0 1 1341 564" fill="none" stroke="#b8f2d3" stroke-width="26" opacity=".18"/>
${cloud(173,280,1.4)}${cloud(690,203,.7)}${cloud(1470,355,1.6)}
${island(355,357,.45)}${island(1300,422,.5)}${island(858,267,.3)}
<path d="M0 663Q120 566 242 641Q366 552 482 645Q654 570 800 656Q1006 550 1122 639Q1333 546 1447 649Q1510 606 1600 647V800H0Z" fill="#dddff6"/>
<path d="M0 735Q170 640 327 728Q535 648 707 731Q862 638 1062 726Q1260 626 1423 724Q1534 652 1600 709V800H0Z" fill="#f0eefb"/>
${sparkle(540,278,.85)}${sparkle(1025,122,.7)}${sparkle(1430,165,.6)}${sparkle(126,476,.6)}
`)

save('island',gradient('sky','#78d5dc','#e3f6d6')+gradient('sea','#38bfc5','#147e9d'),`
<path fill="url(#sky)" d="M0 0H1600V800H0Z"/>
<circle cx="1255" cy="200" r="125" fill="#fff0c5" opacity=".3"/><circle cx="1255" cy="200" r="77" fill="#ffefb5"/>
${cloud(238,177,.9)}${cloud(817,125,.55)}${cloud(1460,299,1)}
<path d="M0 427Q180 390 390 430Q577 405 770 430Q1040 387 1210 422Q1430 399 1600 426V800H0Z" fill="url(#sea)"/>
<path d="M126 430Q231 305 356 428M1100 432Q1210 309 1320 430" fill="#309e99"/>
<path d="M159 431Q222 378 314 432M1150 432Q1210 365 1280 431" fill="#59bc9b"/>
<g stroke="#a9f7e4" stroke-width="4" stroke-linecap="round" opacity=".6">${Array.from({length:16},(_,i)=>`<path d="M${(i*311)%1550} ${477+(i%5)*54}h${45+(i%4)*28}"/>`).join('')}</g>
<path d="M0 701Q187 601 350 657Q555 730 813 677Q1124 602 1292 651Q1460 612 1600 677V800H0Z" fill="#e2bd80"/>
<path d="M0 686Q187 586 350 642Q555 715 813 662Q1124 587 1292 636Q1460 597 1600 662V800H0Z" fill="#ffe8b2"/>
<path d="M0 681Q187 581 350 637Q555 710 813 657Q1124 582 1292 631Q1460 592 1600 657" fill="none" stroke="#fff7d6" stroke-width="10"/>
${palm(113,661,1.9)}${palm(1472,670,1.6)}
<path d="M0 761Q110 691 245 780M1374 800Q1490 715 1600 762" fill="none" stroke="#277f6b" stroke-width="75"/>
<g fill="#efb79c"><path d="M334 721l8-17 8 15 18 1-14 12 3 17-15-9-16 8 4-16-12-12Z"/><path d="M1290 731l6-13 6 12 14 1-11 9 2 13-12-7-12 6 3-12-9-9Z"/></g>
`)

const tower=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-49 0V-207H49V0" fill="url(#stone)"/><path d="M-69-205L0-333 69-205Z" fill="#755b9d"/><path d="M-69-205L0-333 0-205Z" fill="#9e7bb7"/><path d="M-40-218L0-298" stroke="#c2a3c8" stroke-width="5"/><path d="M-13-104V-145Q0-169 13-145V-104Z" fill="#f0d299"/><path d="M-49-67H49M-49-187H49" stroke="#8e75ad" stroke-width="7"/><path d="M0-333V-376L50-359 0-347" fill="#d494c2" stroke="#d7afd1" stroke-width="3"/></g>`
save('castle',gradient('sky','#191c4d','#655b9b')+gradient('stone','#6c579a','#353463'),`
<path fill="url(#sky)" d="M0 0H1600V800H0Z"/>
${stars}
<circle cx="1230" cy="210" r="155" fill="#c5a8e0" opacity=".08"/><circle cx="1230" cy="210" r="112" fill="#c5a8e0" opacity=".1"/><circle cx="1230" cy="210" r="75" fill="#ffdfc6"/>
<path d="M0 499L149 353 271 452 381 332 530 486 713 395 831 494 1002 363 1123 486 1360 333 1600 474V800H0Z" fill="#353762"/>
<path d="M0 586L212 475 404 565 600 452 824 588 1019 479 1233 564 1420 435 1600 545V800H0Z" fill="#292d52"/>
<path d="M447 661V399H1152V661" fill="url(#stone)"/>
<path d="M447 418V379H489V398H531V379H574V398H617V379H661V399H703V379H747V398H789V379H832V398H875V379H918V398H962V379H1005V398H1048V379H1090V398H1152V418Z" fill="#9d85b5"/>
${tower(493,670,.92)}${tower(1091,670,.92)}${tower(792,570,1.25)}
<path d="M700 685V536Q792 404 883 536V685" fill="#272653" stroke="#a68abf" stroke-width="13"/>
<path d="M729 685V548Q792 453 854 548V685" fill="#a991d3" opacity=".45"/>
<path d="M0 738Q350 646 600 708Q902 641 1200 709Q1420 656 1600 730V800H0Z" fill="#262d51"/>
<path d="M558 800L729 675H854L1042 800" fill="#766b9f"/>
<path d="M571 791H1029M628 750H969M681 714H909" fill="none" stroke="#ae97c2" stroke-width="5" opacity=".6"/>
<g fill="#61b8bd" opacity=".9"><path d="M106 740l22-97 30 44 7 55Z"/><path d="M162 755l30-67 19 32-4 40Z"/><path d="M1418 751l18-116 35 59-4 70Z"/></g>
${sparkle(310,170,.8)}${sparkle(1070,163,.6)}${sparkle(1360,374,.5)}
`)
console.log('Created four original SVG worlds in public/assets/worlds.')
