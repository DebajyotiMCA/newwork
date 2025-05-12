import { LightningElement, api, wire, track } from 'lwc';
import getAggregatedContactData from '@salesforce/apex/ContactAggregatorController.getAggregatedContactData';
import saveSelections from '@salesforce/apex/ContactAggregatorController.saveSelections';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
  { label: 'Type', fieldName: 'Type' },
  { label: 'State', fieldName: 'State' },
  { label: '# of Contacts', fieldName: 'Count', type: 'number' }
];

export default class ContactTypeSelector extends LightningElement {
  @api recordId;
  @track data = [];
  @track error;
  @track selectedRows = [];
  errors = {};

  columns = columns;

 @wire(getAggregatedContactData, { accountId: '$recordId' })
  wiredContacts({ error, data }) {
    if (data) {
      this.data = data;
      console.log('==>'+JSON.stringify(data));
      this.error = undefined;
    } else if (error) {
      this.error = error.body.message;
      this.data = [];
    }
  }

  handleRowSelection(event) {
    //const selectedRow = event.detail.selectedRows;
    //this.selectedRows = selectedRow.map(row => row.id);
      

    const datatable = this.template.querySelector('lightning-datatable[data-id=\"myTable\"]');
    const selectedRows = datatable.getSelectedRows();

    this.selectedRows = selectedRows.map(row => row);
    console.log('Selected Rows: ', JSON.stringify(this.selectedRows)); 

  }
  triggerError(){
    this.errors = {
            rows: {
                '001Hp00003m53RrIAI||NSW||A': {
                    title: 'We found 2 errors.',
                    messages: [                        
                        'Too many',
                    ],
                    fieldNames: ['Count'],
                },
            }
        };
  }

  handleSubmit() {    
    
    saveSelections({ accountId: this.recordId, selections: this.selectedRows })
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Success',
            message: 'Contact Aggregates Updated',
            variant: 'success'
          })
        );
      })
      .catch(error => {        
        this.dispatchEvent(
          new ShowToastEvent({
            title: 'Error',
            message: error.body.message,
            variant: 'error'
          })
        );
      });
  }
}