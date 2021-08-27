import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';
import { CSVNameMatch, FileProperties } from './models/name-match';

@Component({
  selector: 'app-name-match',
  templateUrl: './name-match.component.html',
  styleUrls: ['./name-match.component.css']
})
export class NameMatchComponent implements OnInit {

  firstWord = "";
  secondWord = "";
  keyword = "matches";
  resultarea = "";          //represents the text area that all current results and calculations get appended to
  goodMatchThreshold = 80;

  maleIdentifier = 'm';
  femaleIdentifier = 'f';
  csvFileContents = null;                     //Represents the entire csv file contents read as string
  csvFileProperties: FileProperties = null;   //Used to get CSV file properties when uploaded. (Not neccessary, just nice ;D)

  csvseperator = ";";                         //Comma value to delimit the csvFileContents
  csvlinebreaker = "\r\n";                    //new line seperator to split the CSV rows into seperate entires

  maleNames: CSVNameMatch[] = [];
  femaleNames: CSVNameMatch[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  onFirstWord(value: string) {
    this.firstWord = value.trim();
  }

  onSecondWord(value: string) {
    this.secondWord = value.trim();
  }

  enableSingleMatch() {
    return this.firstWord && this.secondWord;
  }

  singleMatch() {
    if(this.enableSingleMatch()) {
      this.resultarea = ""
      this.calculatematch(this.firstWord, this.secondWord);
    }
  }


  /*
    Calculates the sum string to be evauluated for the match percentage. After it is calculated, 
    the resultMatchSum method is called to calculate the percentage match
  */

  public calculatematch(firstword, secondword) {

    let temp = firstword + this.keyword + secondword;   //Match string to handle
    let testChar = "";                                  //Character that gets picked out on each iteration
    let tempSum = 0;                                    //Total amount of testChar
    let sumString = "";                                 //Records sums of ALL testChars proccessed
    let log = "\n\n--------------------------------------------\n\n";
    this.resultarea += log;
    log = "\n\nCalculating for: " + temp + "\n\n";
    this.resultarea += log;
    temp = temp.toLowerCase();

    while(temp) {
      testChar = temp.charAt(0);
      var re = new RegExp(testChar, "g");
      tempSum = 0;
      [...temp].forEach(char => {
        if(char==testChar) tempSum +=1;
      });
      sumString += tempSum;
      log = temp + ": " + sumString + "\n";
      temp = temp.replace(re, '');
      this.resultarea += log;
    }

    let matchpercentage = this.resultMatchSum(sumString);

    this.resultarea += "\n\n" + firstword + " matches " + secondword + " " + matchpercentage + "%";
    if((Number)(matchpercentage) >= this.goodMatchThreshold) this.resultarea += " goodmatch";     
    
  }

  /*
    This method starts the intitial proccessing of a sumstring generated for a match
  */

  resultMatchSum(previousstring) {
    let log = "\n\nResulting calculation for sumstring: " + previousstring + "\n\n";
    this.resultarea += log;
    let nextstring = "";

    while(true) {
      nextstring = this.evaluateSumString(previousstring);
      log = previousstring + " => " + nextstring + "\n";
      this.resultarea += log;
      previousstring = nextstring;
      if(nextstring.length<=2) {
        break;
      }
    }

    return nextstring;

  }

  /*
    This method evaulates the currently proccessing sumstring at a given time. Meant to be recursioned through.
  */

  evaluateSumString(sumstring : string) {
    let newstring = "";

    while(sumstring.length>0) {
      if(sumstring.length==3) {
        newstring += (Number)(sumstring[0]) + (Number)(sumstring[2]);
        newstring += sumstring[1];
        break;
      }
      newstring += (Number)(sumstring.charAt(0)) + (Number)(sumstring.charAt(sumstring.length-1));
      sumstring = sumstring.substring(1, sumstring.length-1);
    }
    return newstring;
  }

  /*
    This method handles the upload of a CSV file, and appends the data as string to csvFileContents
    Calls proccessCSVFile to aggregate male and female collections of names
  */
  
  public fileUpload(files: FileList){
    if(files && files.length > 0) {
        let file : File = files.item(0); 
        this.csvFileProperties = {
          name : file.name,
          size : file.size,
          type : file.type
        }
        let reader: FileReader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
          this.csvFileContents = reader.result as string;
          this.csvFileContents = this.csvFileContents.split(this.csvlinebreaker);
          this.proccessCSVFile()
        }
      }
  }

  /*
    Starts aggregation of male and female lists by looking at each row of the CSV file data
  */

  public proccessCSVFile() {
    if(this.csvFileContents && this.csvFileContents.length > 0) {
      this.csvFileContents.forEach(element=>{
        if(element && element!="") {
          this.appendPersonToCollections(element.split(this.csvseperator));
        }
      });
    }
  }

  /*
    Appends a given row of CSV data to the male or female collection
  */

  private appendPersonToCollections(person) {

    const tempperson: CSVNameMatch = {
      name: person && person[0]?.trim().toLowerCase(),
      gender: person && person[1]?.trim().toLowerCase()
    };

    if(tempperson.gender == this.maleIdentifier && !this.maleNames.some(person => person.name==tempperson.name)) {
      this.maleNames.push(tempperson);
    }

    else if(tempperson.gender == this.femaleIdentifier && !this.femaleNames.some(person => person.name==tempperson.name)){
      this.femaleNames.push(tempperson);
    }

  }

  /*
    Main method to start proccessing of uploaded CSV file data
  */

  public proccessCSVNames() {
    if(this.maleNames.length>=1 && this.femaleNames.length>=1) {
      for (let i = 0; i < this.maleNames.length; i++) {
        this.femaleNames.forEach(female => this.calculatematch(this.maleNames[i].name, female.name));
      }
    }
  }

}
