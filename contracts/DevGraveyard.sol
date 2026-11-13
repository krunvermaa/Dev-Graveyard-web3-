// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DevGraveyard {
    // ---- Profiles ----
    struct UserProfile {
        address wallet;
        string username;
        string avatarUrl;
        uint256 joinedAt;
        bool exists;
    }

    mapping(address => UserProfile) public profiles;
    mapping(string => address) public usernameToWallet; // lowercase username to wallet
    address[] public allUsers;

    // ---- Graves ----
    struct Grave {
        uint256 id;
        address owner;
        string projectName;
        string causeOfDeath;
        string lessonLearned;
        string githubLink;
        bool isAnonymous;
        uint256 respects;
        uint256 createdAt;
    }

    uint256 private _graveIds;
    mapping(uint256 => Grave) public graves;
    uint256[] public allGraveIds;

    // ---- Interactions ----
    struct Eulogy {
        uint256 id;
        address author;
        string text;
        uint256 timestamp;
    }

    uint256 private _eulogyIds;
    mapping(uint256 => Eulogy[]) public graveEulogies;
    mapping(uint256 => mapping(address => bool)) public hasRespected;
    
    // ---- Social ----
    // Followers: user => array of follower addresses
    mapping(address => address[]) public followers;
    // Following: user => array of following addresses
    mapping(address => address[]) public following;
    
    mapping(address => mapping(address => bool)) public isFollowing;

    // ---- Events ----
    event ProfileCreated(address indexed wallet, string username);
    event ProfileUpdated(address indexed wallet, string avatarUrl);
    event GraveCreated(uint256 indexed id, address indexed owner, string projectName);
    event GraveRespected(uint256 indexed id, address indexed respecter, bool isF);
    event EulogyAdded(uint256 indexed graveId, uint256 indexed eulogyId, address indexed author);
    event Followed(address indexed follower, address indexed following);
    event Unfollowed(address indexed follower, address indexed following);

    // ---- Profile Methods ----
    function createProfile(string memory _username, string memory _avatarUrl) public {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(usernameToWallet[_toLower(_username)] == address(0), "Username taken");

        profiles[msg.sender] = UserProfile({
            wallet: msg.sender,
            username: _username,
            avatarUrl: _avatarUrl,
            joinedAt: block.timestamp,
            exists: true
        });

        usernameToWallet[_toLower(_username)] = msg.sender;
        allUsers.push(msg.sender);

        emit ProfileCreated(msg.sender, _username);
    }

    function updateProfile(string memory _avatarUrl) public {
        require(profiles[msg.sender].exists, "Profile does not exist");
        profiles[msg.sender].avatarUrl = _avatarUrl;
        emit ProfileUpdated(msg.sender, _avatarUrl);
    }

    function getProfile(address _wallet) public view returns (UserProfile memory) {
        return profiles[_wallet];
    }
    
    function getProfileByUsername(string memory _username) public view returns (UserProfile memory) {
        address wallet = usernameToWallet[_toLower(_username)];
        return profiles[wallet];
    }

    function checkUsername(string memory _username) public view returns (bool) {
        return usernameToWallet[_toLower(_username)] == address(0);
    }

    // ---- Grave Methods ----
    function createGrave(
        string memory _projectName,
        string memory _causeOfDeath,
        string memory _lessonLearned,
        string memory _githubLink,
        bool _isAnonymous
    ) public returns (uint256) {
        require(profiles[msg.sender].exists || _isAnonymous, "Must have profile or be anonymous");

        _graveIds++;
        uint256 newGraveId = _graveIds;

        graves[newGraveId] = Grave({
            id: newGraveId,
            owner: msg.sender,
            projectName: _projectName,
            causeOfDeath: _causeOfDeath,
            lessonLearned: _lessonLearned,
            githubLink: _githubLink,
            isAnonymous: _isAnonymous,
            respects: 0,
            createdAt: block.timestamp
        });

        allGraveIds.push(newGraveId);

        emit GraveCreated(newGraveId, msg.sender, _projectName);
        return newGraveId;
    }

    function pressF(uint256 _graveId) public {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(!hasRespected[_graveId][msg.sender], "Already paid respects");

        graves[_graveId].respects++;
        hasRespected[_graveId][msg.sender] = true;

        emit GraveRespected(_graveId, msg.sender, true);
    }

    function unpressF(uint256 _graveId) public {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(hasRespected[_graveId][msg.sender], "Have not paid respects");

        graves[_graveId].respects--;
        hasRespected[_graveId][msg.sender] = false;

        emit GraveRespected(_graveId, msg.sender, false);
    }

    function dropEulogy(uint256 _graveId, string memory _text) public {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(profiles[msg.sender].exists, "Must have profile");

        _eulogyIds++;
        uint256 newEulogyId = _eulogyIds;

        graveEulogies[_graveId].push(Eulogy({
            id: newEulogyId,
            author: msg.sender,
            text: _text,
            timestamp: block.timestamp
        }));

        emit EulogyAdded(_graveId, newEulogyId, msg.sender);
    }

    function deleteGrave(uint256 _graveId) public {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(graves[_graveId].owner == msg.sender, "Not the owner");
        
        // Remove from graves mapping (set id to 0 to mark as deleted)
        delete graves[_graveId];
        
        // Remove from allGraveIds
        for (uint i = 0; i < allGraveIds.length; i++) {
            if (allGraveIds[i] == _graveId) {
                allGraveIds[i] = allGraveIds[allGraveIds.length - 1];
                allGraveIds.pop();
                break;
            }
        }
    }

    function deleteEulogy(uint256 _graveId, uint256 _eulogyId) public {
        require(graves[_graveId].id != 0, "Grave does not exist");
        bool found = false;
        
        for (uint i = 0; i < graveEulogies[_graveId].length; i++) {
            if (graveEulogies[_graveId][i].id == _eulogyId) {
                require(graveEulogies[_graveId][i].author == msg.sender || graves[_graveId].owner == msg.sender, "Not authorized");
                graveEulogies[_graveId][i] = graveEulogies[_graveId][graveEulogies[_graveId].length - 1];
                graveEulogies[_graveId].pop();
                found = true;
                break;
            }
        }
        
        require(found, "Eulogy not found");
    }

    function getGraveCount() public view returns (uint256) {
        return allGraveIds.length;
    }

    function getEulogies(uint256 _graveId) public view returns (Eulogy[] memory) {
        return graveEulogies[_graveId];
    }

    // ---- Social Methods ----
    function follow(address _target) public {
        require(profiles[msg.sender].exists, "Must have profile");
        require(profiles[_target].exists, "Target profile must exist");
        require(_target != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][_target], "Already following");

        isFollowing[msg.sender][_target] = true;
        following[msg.sender].push(_target);
        followers[_target].push(msg.sender);

        emit Followed(msg.sender, _target);
    }

    function unfollow(address _target) public {
        require(isFollowing[msg.sender][_target], "Not following");

        isFollowing[msg.sender][_target] = false;
        
        // Remove from following array
        for (uint i = 0; i < following[msg.sender].length; i++) {
            if (following[msg.sender][i] == _target) {
                following[msg.sender][i] = following[msg.sender][following[msg.sender].length - 1];
                following[msg.sender].pop();
                break;
            }
        }
        
        // Remove from followers array
        for (uint i = 0; i < followers[_target].length; i++) {
            if (followers[_target][i] == msg.sender) {
                followers[_target][i] = followers[_target][followers[_target].length - 1];
                followers[_target].pop();
                break;
            }
        }

        emit Unfollowed(msg.sender, _target);
    }
    
    function getFollowers(address _user) public view returns (address[] memory) {
        return followers[_user];
    }
    
    function getFollowing(address _user) public view returns (address[] memory) {
        return following[_user];
    }

    // ---- Utility ----
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}
