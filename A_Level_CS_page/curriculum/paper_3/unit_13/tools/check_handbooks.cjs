const { chromium } = require('C:/Users/Nguyen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');const path=require('path');const {pathToFileURL}=require('url');
const root=path.resolve(__dirname,'..');const output=path.join(root,'qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
for(const name of ['STUDENT_HANDBOOK.html','TEACHER_HANDBOOK.html']){
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,name)).href);await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  const stats=await page.evaluate(()=>({images:[...document.images].length,
    brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth,
    tables:document.querySelectorAll('table').length,
    sections:document.querySelectorAll('section.book-part').length}));
  if(stats.images!==66||stats.brokenImages||stats.horizontalOverflow||errors.length)throw Error(JSON.stringify({name,stats,errors}));
  if(name.startsWith('STUDENT')){
    await page.screenshot({path:path.join(output,'student-cover.png')});
    await page.locator('#visual-36').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'student-v36.png')});
    await page.locator('#part-3').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'student-practice.png')});
    await page.locator('#exam-e13').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,'student-exam-e13.png')});
    await page.locator('a[href="#theory-3-3"]').first().click();
    if(await page.evaluate(()=>location.hash)!=='#theory-3-3')throw Error('Theory navigation failed');
    await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(output,'student-mobile.png')});
    const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(mobileOverflow)throw Error('Mobile horizontal overflow');
  }
  results.push({name,...stats,scriptErrors:errors});await page.close();
}
const exam=await browser.newPage({viewport:{width:1440,height:1000}});
await exam.goto(pathToFileURL(path.join(root,'EXAM_PATTERNS.html')).href);
await exam.addStyleTag({content:'html{scroll-behavior:auto!important}'});
const examImageStats=await exam.evaluate(()=>({images:document.images.length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length}));
if(examImageStats.images!==26||examImageStats.broken)throw Error(JSON.stringify(examImageStats));
await exam.screenshot({path:path.join(output,'exam-guide-desktop.png')});
await exam.locator('nav a[href="#exam-e04"]').click();
await exam.screenshot({path:path.join(output,'exam-guide-record.png')});
await exam.locator('#exam-visual-61').scrollIntoViewIfNeeded();
await exam.screenshot({path:path.join(output,'exam-visual-truncation.png')});
await exam.locator('a[href="STUDENT_HANDBOOK.html#theory-1-3"]').first().click();
if(await exam.evaluate(()=>location.hash)!=='#theory-1-3')throw Error('Standalone theory link failed');
await exam.goto(pathToFileURL(path.join(root,'EXAM_PATTERNS.html')).href);
await exam.addStyleTag({content:'html{scroll-behavior:auto!important}'});
await exam.setViewportSize({width:390,height:844});
await exam.locator('#exam-e13').scrollIntoViewIfNeeded();
await exam.screenshot({path:path.join(output,'exam-guide-mobile.png')});
if(await exam.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Exam mobile overflow');
results.push({name:'EXAM_PATTERNS.html',...examImageStats,theoryNavigation:true,mobileOverflow:false});
await exam.close();
const gallery=await browser.newPage({viewport:{width:1440,height:1000}});
await gallery.goto(pathToFileURL(path.join(root,'exam_visuals/index.html')).href);
await gallery.evaluate(async()=>{for(const im of document.images)im.loading='eager';await Promise.all([...document.images].map(im=>im.decode()));});
const galleryStats=await gallery.evaluate(()=>({images:document.images.length,broken:[...document.images].filter(i=>!i.naturalWidth).length,horizontalOverflow:document.documentElement.scrollWidth>innerWidth}));
if(galleryStats.images!==26||galleryStats.broken||galleryStats.horizontalOverflow)throw Error(JSON.stringify(galleryStats));
await gallery.screenshot({path:path.join(output,'exam-visual-gallery-desktop.png')});
await gallery.setViewportSize({width:390,height:844});
await gallery.locator('#U13-V60').scrollIntoViewIfNeeded();
await gallery.screenshot({path:path.join(output,'exam-visual-gallery-mobile.png')});
if(await gallery.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Gallery mobile overflow');
results.push({name:'exam_visuals/index.html',...galleryStats,mobileOverflow:false});
await gallery.close();
await browser.close();fs.writeFileSync(path.join(output,'handbook_browser_checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
