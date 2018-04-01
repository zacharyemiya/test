pragma solidity ^0.4.18;
contract SimpleStorage{
    address Admin;
    mapping(string => File) Files;
    string[] FileKey;
    
    struct File{
        bytes32 FileBase58;
        uint FileDate;
        address User;
    }
    
    function SimpleStorage() public payable{
        Admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        if(msg.sender != Admin)
            revert();
        _;
    }
    
    function addFile(bytes32 text,string Key) public payable{
        if(Files[Key].FileBase58 !=bytes32(0x0000000000000000000000000000000000000000000000000000000000000000))
             {
                revert();
             }
        else
             {
                 FileKey.push(Key);
                 Files[Key].FileBase58 = text;
                 Files[Key].FileDate = now;
                 Files[Key].User = msg.sender;
             }
    }
    
    function getFile(string Key) constant public returns(bytes32){
            if(Files[Key].FileBase58 !=bytes32(0x0000000000000000000000000000000000000000000000000000000000000000))
                {return Files[Key].FileBase58;}
            else{revert();}
        }

    function getFileDate(string Key) constant public returns(uint){
         if(Files[Key].FileBase58 !=bytes32(0x0000000000000000000000000000000000000000000000000000000000000000))
            {return Files[Key].FileDate;}
         else{revert();}
    }

    function getUser(string Key) constant public returns(address){
         if(Files[Key].FileBase58 !=bytes32(0x0000000000000000000000000000000000000000000000000000000000000000))
            {return Files[Key].User;}
         else{revert();}
    }

}

