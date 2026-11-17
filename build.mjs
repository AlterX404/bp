import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
const url = name => new URL(name, import.meta.url);
const sample = readFileSync(url('src/estimate-template.html'),'utf8');
const designer = readFileSync(url('src/designer-template.html'), 'utf8');
const purchase = readFileSync(url('src/purchase-template.html'), 'utf8');
const services = JSON.parse(readFileSync(url('src/services.json'),'utf8'));
const out = (name, text) => writeFileSync(url('site/' + name),text);
mkdirSync(url('site'), {recursive:true});
for (const file of [
  'site.css', 'commerce.css', 'catalog.js', 'storefront.jpg', 'interior.jpg', 'preview-street.jpg',
  'sign-options.js', 'sign-renderer.js', 'designer.js', 'purchase.js'
]) copyFileSync(url('src/'+file),url('site/'+file));
const sceneAssets = {};
for (const scene of ['street', 'reception']) {
  sceneAssets[scene] = 'data:image/jpeg;base64,' + readFileSync(url('src/preview-'+scene+'.jpg')).toString('base64');
}
out('preview-assets.js', 'window.BrandPulseScenes = ' + JSON.stringify(sceneAssets) + ';\n');
out('estimate.js', 'const services = ' + JSON.stringify(services.map(({id,name,sign}) => ({id,name,sign})),null,2) + ';\n' + readFileSync(url('src/estimate.js'),'utf8'));
const brand = 'Brand Pulse Creatives';
const image = (kind, caption, alt) => '<figure><img src="'+kind+'.jpg" width="1200" height="800" alt="'+alt+'"><figcaption>'+caption+'</figcaption></figure>';
const button = (label,href='estimate.html') => '<a class="cta" href="'+href+'">'+label+' <span aria-hidden="true">↗</span></a>';
const heading = (label,title,body) => '<div class="heading wrap"><p class="eyebrow">'+label+'</p><h1>'+title+'</h1><p>'+body+'</p></div>';
const nav = [['services.html','Services'],['studio.html','Capabilities'],['purchase.html','Order signs'],['contact.html','Contact']];
const designerLink = 'sign-design.html';
const signScripts = page => ['sign-options.js','preview-assets.js','sign-renderer.js',page].map(file => '<script defer src="'+file+'"></script>').join('');
function shell(title, desc, page, body) {
  const meta = desc.replaceAll('&','&amp;').replaceAll('"','&quot;');
  const showMobile = !['estimate.html', 'sign-design.html', 'purchase.html'].includes(page);
  const navigation = nav.map(([href,label]) => '<a href="'+href+'"'+(href===page?' aria-current="page"':'')+'>'+label+'</a>').join('');
  const wordmark = '<a class="brand" href="index.html"><b aria-hidden="true">◒</b><span>BRAND PULSE<small>CREATIVES</small></span></a>';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><meta name="description" content="'+meta+'"><meta property="og:title" content="'+title+' | '+brand+'"><meta property="og:description" content="'+meta+'"><meta name="theme-color" content="#171814"><title>'+title+' | '+brand+'</title><link rel="stylesheet" href="site.css"><link rel="stylesheet" href="commerce.css"></head><body><a class="skip" href="#main">Skip to content</a><header><div class="wrap nav">'+wordmark+'<nav aria-label="Main">'+navigation+'</nav>'+button('Design a sign',designerLink)+'</div></header><main id="main">'+body+'</main><footer><div class="wrap footer">'+wordmark+'<p>Signage &amp; retail branding<br>Greater Noida, Uttar Pradesh</p><div><a href="services.html">Services</a><a href="sign-design.html">Design a sign</a><a href="purchase.html">Order signs</a><a href="contact.html">Contact</a></div><small>Independent website demo</small></div></footer>'+(showMobile?'<div class="mobile">'+(page==='index.html'?button('Design a sign',designerLink):button('Request an estimate'))+'</div>':'')+'</body></html>';
}
const cards = services.map((s,i)=>'<article data-group="'+s.group+'" data-search="'+(s.name+' '+s.blurb).toLowerCase().replaceAll('&','&amp;')+'" class="service"><p class="eyebrow">'+s.group+'</p><h3><a href="'+s.id+'.html">'+s.name+' <span aria-hidden="true">↗</span></a></h3><p>'+s.blurb+'</p></article>').join('');
out('index.html',shell('Signage & retail branding in Greater Noida','Custom signs, in-store branding and retail fit-outs for shops, cafés and restaurants.','index.html',
'<section class="hero"><div class="wrap hero-grid"><div class="hero-copy"><p class="eyebrow">GREATER NOIDA / RETAIL &amp; F&amp;B</p><h1>Make your<br>space <em>seen.</em></h1><p>Custom signage, in-store branding and retail fit-outs for shops, cafés and restaurants.</p><div class="actions">'+button('Design a sign',designerLink)+'<a class="arrow" href="estimate.html">Request an estimate ↗</a></div></div>'+image('storefront','Illustrative storefront concept','Café storefront with illuminated After Hours lettering')+'</div></section>'+
'<section class="shop-feature"><div class="wrap split"><div><p class="eyebrow">CUSTOM SIGN DESIGNER</p><h2>Your name<br>above the door.</h2><p>Preview lettering, colours and lighting on a sample storefront or your own shop photo. Carry your design into an estimate or try the demo checkout.</p><div class="actions">'+button('Try the sign designer',designerLink)+'<a class="arrow" href="purchase.html">Order signs ↗</a></div></div><figure class="shop-feature-preview"><img src="preview-street.jpg" loading="lazy" width="1200" height="800" alt="Sample storefront with a charcoal-green fascia"><span class="sample-letters">MORROW COFFEE</span><figcaption>Illustrative sign mockup</figcaption></figure></div></section>'+
'<section class="wrap section"><div class="section-head"><div><p class="eyebrow">SERVICES</p><h2>From the street<br>to the shop floor.</h2></div><p>Find the right starting point for a new storefront, an interior refresh or a store opening.</p></div><div class="services">'+cards+'</div></section>'+
'<section class="feature"><div class="wrap split">'+image('interior','Illustrative in-store branding concept','Coffee shop interior with green lettering on a cream wall')+'<div><p class="eyebrow">DESIGN / FABRICATION / INSTALLATION</p><h2>One brief.<br>The whole space.</h2><p>Share the location, launch date and areas you need branded. Start with a single sign or describe a broader fit-out.</p>'+button('See capabilities','studio.html')+'</div></div></section>'+
'<section class="wrap end"><h2>Planning an opening or refresh?</h2>'+button('Start your project brief')+'</section>'));
out('services.html',shell('Services','Browse storefront signs, neon signage, in-store branding and fit-outs.','services.html',
heading('SERVICES','Find the right starting point.','Explore signage, in-store branding and fit-outs. Each service includes a short checklist for your estimate.')+
'<section class="wrap section catalog"><div class="filters" aria-label="Filter services"><button aria-pressed="true" data-filter="all">All services</button><button aria-pressed="false" data-filter="Signage">Signage</button><button aria-pressed="false" data-filter="Branding">Branding</button><button aria-pressed="false" data-filter="Fit-outs">Fit-outs</button></div><label class="search">Search services<input type="search" id="search" placeholder="Try neon or storefront"></label><p id="results" role="status"></p><div class="services">'+cards+'</div><div id="empty" hidden><h2>No matching services</h2><button type="button" id="reset">Clear filters</button></div></section><script src="catalog.js" defer></script>'));
for (const s of services) {
  const interior = !s.sign || s.id==='neon';
  const art = s.id==='neon' ? '<figure class="neon-art"><div aria-hidden="true">open<br>late</div><figcaption>Illustrative neon lettering concept</figcaption></figure>' :
    interior ? image('interior','Illustrative in-store branding concept','Coffee shop interior with green wall lettering') : image('storefront','Illustrative storefront concept','Café storefront with illuminated lettering');
  const quoteLink = 'estimate.html?service=' + s.id;
  const previewLink = designerLink + '?type=' + (s.id==='neon'?'neon':'channel');
  const actions = s.sign ? button('Preview your sign',previewLink) + '<a class="arrow" href="'+quoteLink+'">Request an estimate ↗</a>' : button('Request an estimate for this service',quoteLink);
  out(s.id+'.html',shell(s.name,s.blurb,'services.html','<section class="wrap detail"><a class="arrow" href="services.html">← All services</a><div class="split"><div><p class="eyebrow">'+s.group+'</p><h1>'+s.name+'</h1><p>'+s.detail+'</p><div class="actions">'+actions+'</div></div>'+art+'</div></section><section class="wrap section"><h2>What to include in your brief</h2><ul class="checklist">'+s.asks.map(a=>'<li>'+a+'</li>').join('')+'</ul></section>'));
}
out('studio.html',shell('Capabilities','Design, fabrication and installation for signage and retail branding.','studio.html',
heading('CAPABILITIES','From design to installation.','Brand Pulse Creatives works on signage, in-store branding and retail environments for shops, cafés and restaurants.')+
'<section class="wrap section split">'+image('interior','Illustrative fit-out concept','Branded coffee shop interior')+'<ol class="process"><li><b>Design</b><p>Share your artwork, wording and the space you want to brand.</p></li><li><b>Fabrication</b><p>Include estimated dimensions, placement and finish preferences.</p></li><li><b>Installation</b><p>Include the site locality, access constraints and required date.</p></li></ol></section><section class="wrap section faq"><h2>Before you enquire</h2><details><summary>What if I don’t know the exact dimensions?</summary><p>Give a rough estimate or leave the field blank. Include where the sign or branding will go.</p></details><details><summary>Can I enquire for several sites?</summary><p>Enter the number of locations and describe anything that differs between them.</p></details><details><summary>What should I share for an outdoor sign?</summary><p>Include the intended mounting surface, approximate size and any lighting or access requirements.</p></details>'+button('Start an estimate')+'</section>'));
out('contact.html',shell('Contact','Find the Ace City Road listing, opening hours and business phone.','contact.html',heading('CONTACT','Talk through your project.','Share the site, the scope and when the space needs to be ready.')+
'<section class="wrap section split"><div class="contact-card"><h2>Ace City Road listing</h2><address>Khasra No, Pargana and Tehsil Dadri, Plot no.01, 829 mi, Ace City Rd, near Apollo Clinic, Bisrakh Jalalpur, Greater Noida, Uttar Pradesh 201306</address><p>Mon–Sat, 9 am–7:30 pm · Sunday closed</p><div class="actions"><a class="cta" href="tel:+919667976663">Call +91 96679 76663</a><a class="arrow" href="https://www.google.com/maps/dir/?api=1&amp;destination=28.5594596%2C77.4583661" target="_blank" rel="noopener noreferrer">Get directions ↗</a></div></div><div><h2>Have a brief in mind?</h2><p>Describe the work and review the details before saving a demo enquiry.</p>'+button('Request an estimate')+'</div></section>'));
out('estimate.html',shell('Request an estimate','Build and review a project brief for Brand Pulse Creatives.','estimate.html',
heading('PROJECT ENQUIRY','Start with your space.','Choose a service, describe the site and review the brief the sales team would see.')+
'<section class="wrap section estimate-layout">'+sample+'<aside><p class="eyebrow">BEFORE YOU START</p><h3>Helpful details</h3><p>Have an approximate location, the service you need and any measurements handy. You can leave optional details blank.</p><details class="inbox"><summary>Demo lead inbox</summary><p>Sample leads saved for this browser session.</p><div id="inbox"></div></details></aside></section><script src="sign-options.js" defer></script><script src="estimate.js" defer></script>'));
out('sign-design.html',shell('Custom Sign Designer','Preview custom sign lettering on a shopfront, reception wall, or your own photo.','sign-design.html',designer+signScripts('designer.js')));
out('purchase.html',shell('Sign Checkout Demo','Review your custom sign and try simulated UPI, card or bank transfer checkout.','purchase.html',purchase+signScripts('purchase.js')));
out('robots.txt','User-agent: *\nDisallow: /\n');

