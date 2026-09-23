export type Lesson={id:string;section:string;code?:string;title:string;goal:string;html:string;visuals:number[];lab:string;terms:string[];theory:string[];examRefs:{url:string;label:string}[];quiz:{question:string;options:string[];answer:number;explanation:string}};
export type Visual={id:number;title:string;src:string;width:number;height:number};
export type Course={lessons:Lesson[];visuals:Visual[];glossary:{term:string;say:string;meaning:string}[]};
export type TeacherScript={lead:string;explain:string;example:string;ask:string;expected:string;mistake:string;close:string};
