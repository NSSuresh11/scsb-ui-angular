import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { SearchService } from 'src/app/services/search/search.service';
import { NgxSpinnerService } from "ngx-spinner";
import { urls } from 'src/config/urls';
declare var $: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [MessageService],
  animations: [
    trigger('rowExpansionTrigger', [
      state('void', style({
        transform: 'translateX(-10%)',
        opacity: 0
      })),
      state('active', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class SearchComponent implements OnInit {
  searchVal: TreeNode[];
  selectedNodes1: any[];
  selectedNodes2: any[];

  cols: any[];
  cols1: any[];
  exportColumns: any[];
  showresultdiv = false;
  clicked = true;
  checked = true;
  firstbutton = true;
  previousbutton = true;
  nextbutton = false;
  lastbutton = false;
  showentries = 10;
  pageNumber = 0;
  totalPageCount: number = 0;
  owningInstitutions: any = [];
  collectionGroupDesignations: any = [];
  availability: any = [];
  materialTypes: any = [];
  useRestrictions: any = [];
  searchForm: FormGroup;
  errorMessage_Div = false;
  searchResultsDiv = false;
  paginationBtmDiv = false;
  postData = {
    "fieldValue": "",
    "fieldName": "",
    "owningInstitutions": [
      "CUL",
      "PUL",
      "NYPL"
    ],
    "collectionGroupDesignations": [
      "Shared",
      "Private",
      "Open"
    ],
    "availability": [
      "Available",
      "NotAvailable"
    ],
    "materialTypes": [
      "Serial",
      "Monograph",
      "Other"
    ],
    "useRestrictions": [
      "NoRestrictions",
      "InLibraryUse",
      "SupervisedUse"
    ],
    "searchResultRows": [],
    "catalogingStatus": "Complete",
    "pageNumber": 0,
    "pageSize": 10,
    "isDeleted": false,
    "totalPageCount": 0,
    "totalBibRecordsCount": "0",
    "totalItemRecordsCount": "0",
    "totalRecordsCount": "0",
    "showResults": false,
    "selectAll": false,
    "selectAllFacets": true,
    "showTotalCount": false,
    "index": null,
    "errorMessage": null
  }

  searchfieldval = [
    { id: 'Author_search', name: "Author" },
    { id: 'Title_search', name: "Title" },
    { id: 'TitleStartsWith', name: "Title Browse(first word)" },
    { id: 'Publisher', name: "Publisher" },
    { id: 'PublicationPlace', name: "Publication Place" },
    { id: 'PublicationDate', name: "Publication Date" },
    { id: 'Subject', name: "Subject" },
    { id: 'ISBN', name: "ISBN" },
    { id: 'ISSN', name: "ISSN" },
    { id: 'OCLCNumber', name: "OCLC Number" },
    { id: 'Notes', name: "Notes" },
    { id: 'CustomerCode', name: "Customer_Code" },
    { id: 'CallNumber_search', name: "Call Number" },
    { id: 'Barcode', name: "Barcode" }
  ];

  @ViewChild('dt') dt: Table;
  constructor(private searchService: SearchService, private messageService: MessageService, private formBuilder: FormBuilder, private router: Router, private spinner: NgxSpinnerService) {

  }
  public data: Object[];

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      fieldValue: [''],
      fieldName: [''],
      owningInstitutionNYPL: [true],
      owningInstitutionCUL: [true],
      owningInstitutionPUL: [true],
      Monograph: [true],
      Serial: [true],
      others: [true],
      shared: [true],
      private: [true],
      open: [true],
      Available: [true],
      notAvailable: [true],
      NoRestrictions: [true],
      InLibraryUse: [true],
      SupervisedUse: [true]
    });
  }

  //show entries api start
  onPageSizeChange(value) {
    this.spinner.show();
    this.showentries = value;
    this.owningInstitutions = [];
    this.collectionGroupDesignations = [];
    this.availability = [];
    this.materialTypes = [];
    this.useRestrictions = [];
    var searchfullrec = this.searchForm.value;
    this.validateInputs(searchfullrec);
    this.searchService.onPageSizeChange(this.setPostData(searchfullrec, 'pageSize')).subscribe((res) => {
      this.searchVal = res;
      this.spinner.hide();
      this.showresultdiv = true;
      this.mappingResults();
      this.pagination();
    },
      (error) => {
        //Called when error
      }
    );
  }

  //show entries api end
  searchRecord() {
    this.spinner.show();
    $("#search-filter").slideUp();
    this.showentries = 10;
    this.owningInstitutions = [];
    this.collectionGroupDesignations = [];
    this.availability = [];
    this.materialTypes = [];
    this.useRestrictions = [];
    var searchfullrec = this.searchForm.value;
    this.validateInputs(searchfullrec);
    this.searchService.getSearch(this.setPostData(searchfullrec, 'search')).subscribe(
      (res) => {
        this.spinner.hide();
        this.searchVal = res
        if (this.searchVal['errorMessage'] != null) {
          this.showresultdiv = true;
          this.errorMessage_Div = true;
          this.searchResultsDiv = false;
          this.paginationBtmDiv = false;
          this.searchVal['pageNumber'] = 0;
        } else {
          this.showresultdiv = true;
          this.errorMessage_Div = false;
          this.searchResultsDiv = true;
          this.paginationBtmDiv = true;
          this.mappingResults();
          this.searchVal['pageNumber'] = 0;
          this.pagination();
        }

      },
      (error) => {
        this.spinner.hide();
        //Called when error
      })

  }

  //next api start
  nextapi() {
    this.spinner.show();
    this.owningInstitutions = [];
    this.collectionGroupDesignations = [];
    this.availability = [];
    this.materialTypes = [];
    this.useRestrictions = [];
    var searchfullrec = this.searchForm.value;
    this.validateInputs(searchfullrec);
    this.showresultdiv = true;
    this.searchService.searchNext(this.setPostData(searchfullrec, 'nextCall')).subscribe(
      (res) => {
        this.spinner.hide();
        this.searchVal = res;
        this.pagination();
      });
    this.mappingResults();
  }
  //next api end

  //previous api start
  previousapi() {
    this.spinner.show();
    this.owningInstitutions = [];
    this.collectionGroupDesignations = [];
    this.availability = [];
    this.materialTypes = [];
    this.useRestrictions = [];

    var searchfullrec = this.searchForm.value;
    this.validateInputs(searchfullrec);
    this.showresultdiv = true;
    this.searchService.searchPrevious(this.setPostData(searchfullrec, 'previousCall')).subscribe(
      (res) => {
        this.spinner.hide();
        this.searchVal = res
        this.pagination();
      });
    this.mappingResults();
  }
  //previous api end

  //first api start
  firstapi() {
    this.spinner.show();
    this.owningInstitutions = [];
    this.collectionGroupDesignations = [];
    this.availability = [];
    this.materialTypes = [];
    this.useRestrictions = [];

    var searchfullrec = this.searchForm.value;
    this.validateInputs(searchfullrec);
    this.searchService.searchFirst(this.setPostData(searchfullrec, 'firstCall')).subscribe(
      (res) => {
        this.spinner.hide();
        this.searchVal = res;
        this.searchVal['pageNumber'] = 0;
        this.pagination();
      });
    this.mappingResults();
  }
  //first api end
  //last api start
  lastapi() {
    this.spinner.show();
    this.owningInstitutions = [];
    this.collectionGroupDesignations = [];
    this.availability = [];
    this.materialTypes = [];
    this.useRestrictions = [];
    var searchfullrec = this.searchForm.value;
    this.validateInputs(searchfullrec);
    this.showresultdiv = true;
    this.searchService.searchLast(this.setPostData(searchfullrec, 'lastCall')).subscribe(
      (res) => {
        this.spinner.hide();
        this.searchVal = res;
        this.pagination();
      });
    this.mappingResults();
  }
  //last api end


  onRowSelect(event) {
    this.clicked = false;
    this.messageService.add({ severity: 'info', summary: 'Car Selected', detail: 'title: ' + event.data.title });
  }

  onRowUnselect(event) {
    this.clicked = true;
    this.messageService.add({ severity: 'info', summary: 'Car Selected', detail: 'title: ' + event.data.title });
  }

  checkUncheckAll() {
    var searchallvalue = this.searchForm.value;
    if (this.checked === true) {
      this.checked = false;
      this.searchForm = this.formBuilder.group({
        fieldValue: [searchallvalue.fieldValue],
        fieldName: [searchallvalue.fieldName],
        owningInstitutionNYPL: [false],
        owningInstitutionCUL: [false],
        owningInstitutionPUL: [false],
        Monograph: [false],
        Serial: [false],
        others: [false],
        shared: [false],
        private: [false],
        open: [false],
        Available: [false],
        notAvailable: [false],
        NoRestrictions: [false],
        InLibraryUse: [false],
        SupervisedUse: [false]

      });
    } else {
      this.checked = true;
      this.searchForm = this.formBuilder.group({
        fieldValue: [searchallvalue.fieldValue],
        fieldName: [searchallvalue.fieldName],
        owningInstitutionNYPL: [true],
        owningInstitutionCUL: [true],
        owningInstitutionPUL: [true],
        Monograph: [true],
        Serial: [true],
        others: [true],
        shared: [true],
        private: [true],
        open: [true],
        Available: [true],
        notAvailable: [true],
        NoRestrictions: [true],
        InLibraryUse: [true],
        SupervisedUse: [true]

      });

    }
  }
  onReset() {
    this.showresultdiv = false;
    this.checked =true;
    this.searchForm = this.formBuilder.group({
      fieldValue: [''],
      fieldName: [''],
      owningInstitutionNYPL: [true],
      owningInstitutionCUL: [true],
      owningInstitutionPUL: [true],
      Monograph: [true],
      Serial: [true],
      others: [true],
      shared: [true],
      private: [true],
      open: [true],
      Available: [true],
      notAvailable: [true],
      NoRestrictions: [true],
      InLibraryUse: [true],
      SupervisedUse: [true]
    });
  }
  setFileName() {
    this.dt.exportFilename = 'ExportRecords' + '_' +
      new DatePipe('en-US').transform(Date.now(), 'yyyyMMddhhmmss', 'UTC');
  }
  routeToRequest() {
    var barcode1 = [];
    var i;
    if (this.selectedNodes1 == undefined) {
      for (i = 0; i < this.selectedNodes2.length; i++) {
        barcode1.push(this.selectedNodes2[i].barcode);
      }
    } else {
      for (i = 0; i < this.selectedNodes1.length; i++) {
        barcode1.push(this.selectedNodes1[i].barcode);
      }
    }
    var barcode = barcode1.join();
    this.router.navigate(['/request', barcode]);
  }

  facetsshowhide() {
    $("#search-filter").slideToggle();
  }

  validateInputs(searchfullrec) {
    if (searchfullrec.owningInstitutionNYPL == true) {
      this.owningInstitutions.push('NYPL')
    }
    if (searchfullrec.owningInstitutionCUL == true) {
      this.owningInstitutions.push('CUL')
    }
    if (searchfullrec.owningInstitutionPUL == true) {
      this.owningInstitutions.push('PUL')
    }

    if (searchfullrec.shared == true) {
      this.collectionGroupDesignations.push('Shared')
    }
    if (searchfullrec.private == true) {
      this.collectionGroupDesignations.push('Private')
    }
    if (searchfullrec.open == true) {
      this.collectionGroupDesignations.push('Open')
    }

    if (searchfullrec.Available == true) {
      this.availability.push('Available')
    }
    if (searchfullrec.notAvailable == true) {
      this.availability.push('NotAvailable')
    }

    if (searchfullrec.Monograph == true) {
      this.materialTypes.push('Monograph')
    }
    if (searchfullrec.Serial == true) {
      this.materialTypes.push('Serial')
    }
    if (searchfullrec.others == true) {
      this.materialTypes.push('Others')
    }

    if (searchfullrec.NoRestrictions == true) {
      this.useRestrictions.push('NoRestrictions')
    }

    if (searchfullrec.InLibraryUse == true) {
      this.useRestrictions.push('InLibraryUse')
    }

    if (searchfullrec.SupervisedUse == true) {
      this.useRestrictions.push('SupervisedUse')
    }
  }
  pagination() {
    if (this.searchVal['pageNumber'] == 0 && (this.searchVal['totalPageCount'] - 1 > 0)) {
      this.firstbutton = true;
      this.previousbutton = true;
      this.nextbutton = false;
      this.lastbutton = false;
    } else if (this.searchVal['pageNumber'] == 0 && (this.searchVal['pageNumber'] == this.searchVal['totalPageCount'] - 1)) {
      this.firstbutton = true;
      this.previousbutton = true;
      this.nextbutton = true;
      this.lastbutton = true;
    }
    else if ((this.searchVal['pageNumber'] == this.searchVal['totalPageCount'] - 1) && this.searchVal['totalPageCount'] - 1 > 0) {
      this.firstbutton = false;
      this.previousbutton = false;
      this.nextbutton = true;
      this.lastbutton = true;
    } else if ((this.searchVal['pageNumber'] < this.searchVal['totalPageCount'] - 1) && (this.searchVal['pageNumber'] != 0)) {
      this.firstbutton = false;
      this.previousbutton = false;
      this.nextbutton = false;
      this.lastbutton = false;
    }
  }
  mappingResults() {
    this.cols = [
      { field: 'title', header: 'Title' },
      { field: 'author', header: 'Author' },
      { field: 'publisher', header: 'Publisher' },
      { field: 'publisherDate', header: 'Publisher Date' },
      { field: 'owningInstitution', header: 'OI' },
      { field: 'customerCode', header: 'CC' },
      { field: 'collectionGroupDesignation', header: 'CGD' },
      { field: 'useRestriction', header: 'Use Restriction' },
      { field: 'barcode', header: 'Barcode' },
      { field: 'summaryHoldings', header: 'SH' }
    ];

    this.cols1 = [
      { field: 'callNumber', header: 'Call Number' },
      { field: 'chronologyAndEnum', header: 'Chronology & Enum' },
      { field: 'customerCode', header: 'CC' },
      { field: 'collectionGroupDesignation', header: 'CGD' },
      { field: 'useRestriction', header: 'Use Restriction' },
      { field: 'barcode', header: 'Barcode' },
    ];
  }
  setPostData(searchfullrec, actionName) {
    if (actionName == 'search') {
      this.showentries = 10;
      this.pageNumber = 0;
    } else if (actionName == 'firstCall') {
      this.pageNumber = 0;
    } else if (actionName == 'lastCall') {
      this.pageNumber = this.searchVal['totalPageCount'];
      this.totalPageCount = this.searchVal['totalPageCount'];
    } else if (actionName == 'previousCall') {
      this.pageNumber = this.searchVal['pageNumber'];
    } else if (actionName == 'nextCall') {
      this.pageNumber = this.searchVal['pageNumber'];
    } else if (actionName == 'pageSize') {
      this.pageNumber = this.searchVal['pageNumber'];
    }
    this.postData = {
      "fieldValue": searchfullrec.fieldValue,
      "fieldName": searchfullrec.fieldName,
      "owningInstitutions": this.owningInstitutions,
      "collectionGroupDesignations": this.collectionGroupDesignations,
      "availability": this.availability,
      "materialTypes": this.materialTypes,
      "useRestrictions": this.useRestrictions,
      "searchResultRows": [],
      "catalogingStatus": "Complete",
      "pageNumber": this.pageNumber,
      "pageSize": this.showentries,
      "isDeleted": false,
      "totalPageCount": this.totalPageCount,
      "totalBibRecordsCount": "0",
      "totalItemRecordsCount": "0",
      "totalRecordsCount": "0",
      "showResults": false,
      "selectAll": false,
      "selectAllFacets": true,
      "showTotalCount": false,
      "index": null,
      "errorMessage": null
    }
    return this.postData;
  }
  // routeTomarc(id){
  //   const url = this.router.serializeUrl(
  //     this.router.createUrlTree(['/openMarcRecord'],{queryParams: { bibId: id }})
  //   );
  //   window.open(url, '_blank');
  //   //this.router.navigate(['/openMarcRecord'],{relativeTo: route, skipLocationChange: true,queryParams: { bibId: id }});
  // }
}
