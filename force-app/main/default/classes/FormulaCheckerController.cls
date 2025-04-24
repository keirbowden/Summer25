public class FormulaCheckerController
{
    @AuraEnabled
    public static String CheckFormula(String formulaStr, String sobjectType, String returnTypeStr,
                                        Id recordId, Boolean formulaIsTemplate)
    {
        FormulaEval.FormulaReturnType returnType=FormulaEval.FormulaReturnType.valueof(returnTypeStr);

        FormulaEval.FormulaInstance formulaInstance = Formula.builder()
                                        .withType(Type.forName(sobjectType))
                                        .withReturnType(returnType)
                                        .withFormula(formulaStr)
                                        .parseAsTemplate(formulaIsTemplate)
                                        .build();


        //Use the list of field names returned by the getReferenced method to generate dynamic soql
        Set<String> fieldNames = formulaInstance.getReferencedFields();
        Set<String> lcFieldNames=new Set<String>();
        for (String fieldName : fieldNames)
        {
            lcFieldNames.add(fieldName.toLowerCase());
        }
        if (lcFieldNames.isEmpty())
        {
            lcFieldNames.add('id');
        }

        String fieldNameList = String.join(lcFieldNames,',');
        String queryStr = 'select ' + fieldNameList + ' from ' + sobjectType + ' where id=:recordId LIMIT 1'; //select name, website from Account
        SObject s = Database.query(queryStr);
        Object formulaResult=formulaInstance.evaluate(s);
        system.debug(formulaResult);

        return formulaResult.toString();
    }
}