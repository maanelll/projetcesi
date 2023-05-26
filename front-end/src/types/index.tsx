export interface IEntreprise {
    id: number
    nom: string
    secteur_act: string
    nb_stage_cesi:number
    localites: ILocalite[]
}

export interface ILocalite {
    id: number
    name:string
}