public with sharing class ContactAggregatorController {

    @AuraEnabled(cacheable=true)
    public static List<AggregateDTO> getAggregatedContactData(Id accountId) {
        List<AggregateDTO> result = new List<AggregateDTO>();

        AggregateResult[] groupedResults = [
            SELECT Type__c, MailingState, COUNT(Id) cn
            FROM Contact
            WHERE AccountId = :accountId
            GROUP BY Type__c, MailingState
        ];

        for (AggregateResult ar : groupedResults) {
            result.add(new AggregateDTO(
                (String)ar.get('Type__c'),
                (String)ar.get('MailingState'),
                (Integer)ar.get('cn'),
                accountId
            ));
        }

        return result;
    }

    @AuraEnabled
    public static void saveSelections(Id accountId, List<AggregateDTO> selections) {
        List<Contact_Aggregate__c> toUpsert = new List<Contact_Aggregate__c>();
        for(AggregateDTO selected : selections){
            system.debug('==>'+selected);
            Contact_Aggregate__c ca = new Contact_Aggregate__c();
            ca.Account__c = accountId;
            ca.State__c = selected.state;
            ca.Type__c =  selected.type;
            ca.Number_of_Contacts__c = selected.Count ;
            ca.Composite_Key__c = accountId + '||' + selected.state+ '||' + selected.type;
            toUpsert.add(ca);
        }       

        try {
            upsert toUpsert Composite_Key__c ;
        } catch (DmlException e) {
            throw new AuraHandledException('Validation Error: ' + e.getMessage());
        }
    }

    public class AggregateDTO {
        @AuraEnabled public String Type { get; set; }
        @AuraEnabled public String State{ get; set; }
        @AuraEnabled public Integer Count{ get; set; }
        @AuraEnabled public String id;

        public AggregateDTO(String type, String state, Integer count,string accountId) {
            this.Type = type;
            this.State = state;
            this.Count = count;
            this.id = accountId + '||' + state+ '||' + type;
        }
        public AggregateDTO(){
        }
    }
}