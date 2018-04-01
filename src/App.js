import React, { Component } from 'react';
import {Button} from 'antd';
import Base58 from 'base-58';
import swal from 'sweetalert';
import logo from './logo.svg'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'



const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

let saveImageOnIpfs = (reader) => {
  return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer).then((response) => {
      console.log(response)
      resolve(response[0].hash);
    }).catch((err) => {
      console.error(err)
      reject(err);
    })
  })
}

function fromIPFSHash(hash) {
  const bytes = Base58.decode(hash);
  const multiHashId = 2;
  return bytes.slice(multiHashId,bytes.length);
}

function toIPFSHash(str) {
  const remove0x = str.slice(2,str.length);
  const bytes = Buffer.from(`1220${remove0x}`,"hex");
  const hash = Base58.encode(bytes);
  return hash;
}

function timestampToTime(timestamp) {
        const date = new Date(timestamp * 1000);
        const Y = date.getFullYear() + '-';
        const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
        const D = date.getDate() + ' ';
        const h = date.getHours() + ':';
        const m = date.getMinutes() + ':';
        const s = date.getSeconds();
        return Y+M+D+h+m+s;
    }


class App extends Component {
  constructor(props) {
    super(props)

    const MyContract = window.web3.eth.contract([
    {
      "constant": true,
      "inputs": [
        {
          "name": "Key",
          "type": "string"
        }
      ],
      "name": "getUser",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "Key",
          "type": "string"
        }
      ],
      "name": "getFileDate",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "Key",
          "type": "string"
        }
      ],
      "name": "getFile",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "text",
          "type": "bytes32"
        },
        {
          "name": "Key",
          "type": "string"
        }
      ],
      "name": "addFile",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "constructor"
    }
  ]);


    this.state={
        ContractInstance:MyContract.at('0x9a270009c8a26d42d2f4ef6b714ff944515dcc3c'),
        blockChainHash: null,
        imgHash: null,
        isWriteSuccess: false,
        InputKey: "",
        SearchKey: "",
        filedate:null,
        UserAddress:null
      }


    this.setInHash = this.setInHash.bind(this);
    this.getFromHash = this.getFromHash.bind(this); 
    this.inputChange = this.inputChange.bind(this);
    this.searchChange = this.searchChange.bind(this);
  }



      setInHash(event){
        
        const {addFile} = this.state.ContractInstance;
        const newHash =  '0x'+new Buffer(fromIPFSHash(this.state.imgHash)).toString('hex');

        addFile(
          newHash,
          this.state.InputKey,
          {
            from:window.web3.eth.accounts[0],
          },(err,result)=>{
            if (err) {
              console.error('error occured::',err);
              this.setState({isWriteSuccess:false});
              swal({
                title:"Failed!",
                text:"Your key is already exist",
                icon:"error"
              })
            }
            else{
              console.log('You have set Hash in blockChain');
              swal({
                title:"Success!",
                text:"You have set Hash in blockChain",
                icon:"success"
              })
              this.setState({isWriteSuccess:true});
            }
          }
          );
      }

      getFromHash(event){
        const {getFile} = this.state.ContractInstance;


        getFile(
          this.state.SearchKey,
          {
            from:window.web3.eth.accounts[0]
          },(err,result)=>{ 
            if (err) {
              console.error('error occured::',err);
              this.setState({blockChainHash:null});
              swal({
                title:"Failed!",
                text:"Your key is incorrect!",
                icon:"error"
              })
            }

            else {
              console.log(result);
              this.setState({blockChainHash:toIPFSHash(result)});
              swal({
                title:"Success!",
                text:"http://localhost:8080/ipfs/" + this.state.blockChainHash,
                icon:"success",
                buttons:true,
                });
             }
            
           }
          );

       const {getFileDate} = this.state.ContractInstance;

       getFileDate(
          this.state.SearchKey,
          {
            from:window.web3.eth.accounts[0]
          },(err,result)=>{
            if(err){
              console.error('error occured')
            }
            else{
              this.setState({filedate:timestampToTime(result)});
              console.log(this.state.filedate);
            }
          }
       );

        const{getUser} = this.state.ContractInstance;

        getUser(
          this.state.SearchKey,
          {
            from:window.web3.eth.accounts[0]
          },(err,result)=>{
            if (err) {
              console.error('error occured')
            }
            else{
              this.setState({UserAddress:result});
              console.log(this.state.UserAddress);
            }
          }
          );
   }

      inputChange(event){
        this.setState({InputKey:event.target.value});
      }

      searchChange(event){
        this.setState({SearchKey:event.target.value});
      }

  

 render() {
    return (
      <div className="App" >
        <header className="App-header">
          <img src={ logo } className="App-logo" alt="logo" />
          <h1 className="App-title">Ethereum SimpleStorage Application</h1>
        </header>
        <br />
        <br />
        <br />
      <label id="file">Choose file to upload</label>
      <input type="file" ref="file" id="file" name="file" multiple="multiple"></input>
      <Button type="primary" onClick={() => {
            var file = this.refs.file.files[0];
            var reader = new FileReader();
            // reader.readAsDataURL(file);
            reader.readAsArrayBuffer(file)
            reader.onloadend = function(e) {
              console.log(reader);
              saveImageOnIpfs(reader).then((hash) => {
                console.log(hash);
                this.setState({imgHash: hash})
                this.setState({blockChainHash:null})
              });

            }.bind(this);

          }}>Upload file to IPFS and return Hash</Button>
      <br />
      <br />
      <h2>fileHash：</h2>
      <br />
      <h2>{this.state.imgHash}</h2>
      <br />
      <input type="text" value={this.state.InputKey} onChange={this.inputChange}></input>
      <input type="button" value="Input File Key and upload to blockchain" onClick={this.setInHash}></input>
      <br />
      <br />
      <input type="text" value={this.state.SearchKey} onChange={this.searchChange}></input>
      <input type="button" value="Search File key and get File Hash" onClick={this.getFromHash}></input>
      <br />
      <br />

     {
        this.state.blockChainHash
          ? <div>
              <h2>Visit : {"http://localhost:8080/ipfs/" + this.state.blockChainHash}</h2>
              <h3>Time:{this.state.filedate},Address:{this.state.UserAddress}</h3>
              <img alt="" style={{
                  width: 400
                }} src={"http://localhost:8080/ipfs/" + this.state.blockChainHash}/>
            </div>
          : <img alt=""/>
      }
      </div>);
  }
}


export default App;
