/* Stable English keys; Portuguese fallback. No fetch, HTML injection, or save-key changes. */
((root)=>{
 'use strict';
 const banks=root.BowLocales||{},fallback='pt-BR',preference='bow_rampage_language';
 let language=fallback;try{const saved=localStorage.getItem(preference);if(banks[saved])language=saved;}catch{}
 const sourceKeys=new Map(Object.entries(banks[fallback]||{}).map(([key,text])=>[text.replace(/\s+/g,' ').trim(),key]));
 const records=new WeakMap(),attributes=new WeakMap();let observer=null;
 function t(key,defaultText,parameters={}){
  const value=banks[language]?.[key]??banks[fallback]?.[key]??defaultText??key;
  return value.replace(/\{([a-zA-Z0-9_]+)\}/g,(match,name)=>parameters[name]===undefined?match:String(parameters[name]));
 }
 function translate(text){const key=sourceKeys.get(text.replace(/\s+/g,' ').trim());return key?text.replace(text.trim(),t(key)):text;}
 function textNode(node){
  if(!node.parentElement||node.parentElement.closest('script,style,textarea,code,pre,.pact-signature,[data-no-i18n]'))return;
  let record=records.get(node);
  if(!record||node.nodeValue!==record.rendered)record={original:node.nodeValue};
  const value=translate(record.original);record.rendered=value;records.set(node,record);
  if(node.nodeValue!==value)node.nodeValue=value;
 }
 function element(node){
  if(node.matches('input,textarea,[data-no-i18n]')&&node.hasAttribute('data-no-i18n'))return;
  const explicit=node.getAttribute('data-i18n');if(explicit&&node.childElementCount===0){const value=t(explicit,node.textContent);if(node.textContent!==value)node.textContent=value;}
  let saved=attributes.get(node)||{};
  for(const name of ['title','aria-label','placeholder','alt']){
   const current=node.getAttribute(name);if(current===null)continue;
   let record=saved[name];if(!record||current!==record.rendered)record={original:current};
   const value=translate(record.original);record.rendered=value;saved[name]=record;if(current!==value)node.setAttribute(name,value);
  }
  attributes.set(node,saved);
 }
 function apply(node=document.body){
  if(!node)return;if(node.nodeType===Node.TEXT_NODE){textNode(node);return;}
  if(node.nodeType!==Node.ELEMENT_NODE)return;element(node);
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let current;while((current=walker.nextNode())){if(current.nodeType===Node.TEXT_NODE)textNode(current);else element(current);}
 }
 function setLanguage(next,{reload=false}={}){
  if(!banks[next])return false;language=next;try{localStorage.setItem(preference,next)}catch{}
  document.documentElement.lang=language;apply(document.head);apply();if(reload)location.reload();return true;
 }
 function install(){
  document.documentElement.lang=language;apply(document.head);apply();
  observer=new MutationObserver(mutations=>{
   for(const mutation of mutations){
    if(mutation.type==='characterData')textNode(mutation.target);
    else if(mutation.type==='attributes')element(mutation.target);
    else for(const node of mutation.addedNodes)apply(node);
   }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt']});
 }
 root.BowI18n={t,apply,setLanguage,get language(){return language},get supported(){return Object.keys(banks)}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(window);
