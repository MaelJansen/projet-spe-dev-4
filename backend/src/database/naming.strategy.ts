import { DefaultNamingStrategy } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

export class CustomNamingStrategy extends DefaultNamingStrategy {
    tableName(className: string, customName: string): string {
        return customName || snakeCase(className);
    }

    columnName(propertyName: string): string {
        return snakeCase(propertyName);
    }
}