import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
export function createModuleLoader(overrides={}){
  const cached=new Map()
  return function loadUrl(relative){
    const file=path.resolve(relative)
    if(cached.has(file))return cached.get(file)
    let output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText
    output=output.replace(/^(import[^\n]*?\sfrom\s+|import\s*)(['"])([^'"]+)\2/gm,(all,prefix,quote,spec)=>{
      if(spec.endsWith('.css'))return ''
      let url=overrides[spec]
      if(!url&&spec.startsWith('.')){
        let target=path.resolve(path.dirname(file),spec)
        if(!path.extname(target))target+=fs.existsSync(target+'.ts')?'.ts':'.tsx'
        url=loadUrl(target)
      }else if(!url)url=import.meta.resolve(spec)
      return `${prefix}${quote}${url}${quote}`
    })
    const url='data:text/javascript;base64,'+Buffer.from(output).toString('base64')
    cached.set(file,url);return url
  }
}
export const loadUrl=createModuleLoader()
