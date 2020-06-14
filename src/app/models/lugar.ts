export enum CATEGORIA_LUGAR {
    UNIDADE_PRF = 'Unidade PRF',
    POSTO_ABASTECIMENTO = 'Posto De Abastecimento',
    LOJA_CONVENIENCIA = 'Loja De Conveniência',
    RESTAURANTE = 'Restaurante',
    PONTO_PARADA = 'Ponto De Parada Com Diversos Serviços (Alimentação, Abastecimento, Manutenção)',
    BORRACHARIA = 'Borracharia',
    OFICINA_MECANICA = 'Oficina Mecânica',
    HOSPEDAGEM = 'Hospedagem',
}

export interface Lugar {
    id: number
    lat: string
    long: string
    category: CATEGORIA_LUGAR
    name: string
    always_open: 'Sim' | 'Não'
    period_info: string
    /**
     * format : "99:99:99"
     */
    open_time: string
    /**
     * format : "99:99:99"
     */
    close_time: string
    /**
     * format : (99) 9999-9999
     */
    phone: string
    details: string
}
