export interface Paginate {
    page: number;          
    pageSize: number;      
  }
  
export type CrudServiceOptions = {
  duplicating?: boolean;
  as?: string;
  association?: string;
  where?: any;
  required?: boolean;
  right?: boolean;
  limit?: number;
  separate?: boolean;
  include?: any; // Pode ser mais específico dependendo da sua aplicação
  order?: any; // Substitua por `Order` se já estiver definido
  subQuery?: boolean;
  attributes?: string[];
  [key: string]: any; // Permite extensibilidade
};


