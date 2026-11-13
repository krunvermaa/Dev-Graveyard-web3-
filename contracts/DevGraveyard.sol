// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DevGraveyard
 * @dev On-chain decentralized memorial for abandoned developer projects,
 *      developer profiles, eulogies, confessions, respects, and social dispatch on Avalanche C-Chain.
 */
contract DevGraveyard is Ownable, ReentrancyGuard {
    // ---- Data Structures ----

    struct UserProfile {
        address wallet;
        string username;
        string avatarUrl;
        string bio;
        string github;
        string instagram;
        string whatsapp;
        uint256 joinedAt;
        bool exists;
    }

    struct Grave {
        uint256 id;
        address owner;
        string projectName;
        string causeOfDeath;
        string livedFor;
        string lessonLearned;
        string techStack;
        string githubLink;
        bool isAnonymous;
        uint256 respects;
        uint256 createdAt;
        bool isResurrected;
        string resurrectionNote;
    }

    struct Eulogy {
        uint256 id;
        address author;
        string text;
        uint256 timestamp;
    }

    struct Confession {
        uint256 id;
        address author;
        string text;
        string color;
        int8 rotation;
        uint256 createdAt;
        uint256 skulls;
        uint256 candles;
    }

    struct DispatchedGrave {
        uint256 id;
        uint256 graveId;
        address fromUser;
        address toUser;
        uint256 timestamp;
    }

    // ---- State Variables ----

    // Profiles
    mapping(address => UserProfile) public profiles;
    mapping(string => address) public usernameToWallet; // lowercase username to wallet
    address[] public allUsers;

    // Graves
    uint256 private _graveIds;
    mapping(uint256 => Grave) public graves;
    uint256[] public allGraveIds;

    // Eulogies & Respects
    uint256 private _eulogyIds;
    mapping(uint256 => Eulogy[]) public graveEulogies;
    mapping(uint256 => mapping(address => bool)) public hasRespected;

    // Confessions
    uint256 private _confessionIds;
    mapping(uint256 => Confession) public confessions;
    uint256[] public allConfessionIds;
    mapping(uint256 => mapping(address => bool)) public hasReactedSkull;
    mapping(uint256 => mapping(address => bool)) public hasReactedCandle;

    // Social Graph
    mapping(address => address[]) private _followers;
    mapping(address => address[]) private _following;
    mapping(address => mapping(address => bool)) public isFollowing;

    // Dispatched / Shared Graves
    uint256 private _dispatchIds;
    mapping(address => DispatchedGrave[]) private _dispatchedGraves; // recipient => DispatchedGrave[]

    // ---- Events ----
    event ProfileCreated(address indexed wallet, string username);
    event ProfileUpdated(address indexed wallet, string avatarUrl);
    event GraveCreated(uint256 indexed id, address indexed owner, string projectName);
    event GraveDeleted(uint256 indexed id, address indexed owner);
    event GraveResurrected(uint256 indexed id, string resurrectionNote);
    event GraveRespected(uint256 indexed id, address indexed user, bool isRespected);
    event EulogyAdded(uint256 indexed graveId, uint256 indexed eulogyId, address indexed author);
    event EulogyDeleted(uint256 indexed graveId, uint256 indexed eulogyId);
    event ConfessionPosted(uint256 indexed id, address indexed author);
    event ConfessionReacted(uint256 indexed id, address indexed user, bool isCandle);
    event Followed(address indexed follower, address indexed following);
    event Unfollowed(address indexed follower, address indexed following);
    event GraveDispatched(uint256 indexed dispatchId, uint256 indexed graveId, address indexed fromUser, address toUser);

    constructor() Ownable(msg.sender) {}

    // ---- Profile Methods ----

    function createProfile(
        string calldata _username,
        string calldata _avatarUrl,
        string calldata _bio,
        string calldata _github,
        string calldata _instagram,
        string calldata _whatsapp
    ) external nonReentrant {
        require(!profiles[msg.sender].exists, "Profile already exists");
        bytes memory uBytes = bytes(_username);
        require(uBytes.length > 0 && uBytes.length <= 32, "Username length invalid");
        require(bytes(_bio).length <= 500, "Bio too long");

        string memory lowerUsername = _toLower(_username);
        require(usernameToWallet[lowerUsername] == address(0), "Username taken");

        profiles[msg.sender] = UserProfile({
            wallet: msg.sender,
            username: _username,
            avatarUrl: _avatarUrl,
            bio: _bio,
            github: _github,
            instagram: _instagram,
            whatsapp: _whatsapp,
            joinedAt: block.timestamp,
            exists: true
        });

        usernameToWallet[lowerUsername] = msg.sender;
        allUsers.push(msg.sender);

        emit ProfileCreated(msg.sender, _username);
    }

    function updateProfile(
        string calldata _avatarUrl,
        string calldata _bio,
        string calldata _github,
        string calldata _instagram,
        string calldata _whatsapp
    ) external nonReentrant {
        require(profiles[msg.sender].exists, "Profile does not exist");
        require(bytes(_bio).length <= 500, "Bio too long");

        UserProfile storage p = profiles[msg.sender];
        p.avatarUrl = _avatarUrl;
        p.bio = _bio;
        p.github = _github;
        p.instagram = _instagram;
        p.whatsapp = _whatsapp;

        emit ProfileUpdated(msg.sender, _avatarUrl);
    }

    function getProfile(address _wallet) external view returns (UserProfile memory) {
        return profiles[_wallet];
    }

    function getProfileByUsername(string calldata _username) external view returns (UserProfile memory) {
        address wallet = usernameToWallet[_toLower(_username)];
        return profiles[wallet];
    }

    function checkUsername(string calldata _username) external view returns (bool) {
        bytes memory b = bytes(_username);
        if (b.length == 0 || b.length > 32) return false;
        return usernameToWallet[_toLower(_username)] == address(0);
    }

    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    // ---- Grave Methods ----

    function createGrave(
        string calldata _projectName,
        string calldata _causeOfDeath,
        string calldata _livedFor,
        string calldata _lessonLearned,
        string calldata _techStack,
        string calldata _githubLink,
        bool _isAnonymous
    ) external nonReentrant returns (uint256) {
        bytes memory pBytes = bytes(_projectName);
        require(pBytes.length > 0 && pBytes.length <= 100, "Project name invalid");
        require(bytes(_lessonLearned).length <= 2000, "Lesson too long");
        require(profiles[msg.sender].exists || _isAnonymous, "Must have profile or be anonymous");

        _graveIds++;
        uint256 newGraveId = _graveIds;

        graves[newGraveId] = Grave({
            id: newGraveId,
            owner: msg.sender,
            projectName: _projectName,
            causeOfDeath: _causeOfDeath,
            livedFor: _livedFor,
            lessonLearned: _lessonLearned,
            techStack: _techStack,
            githubLink: _githubLink,
            isAnonymous: _isAnonymous,
            respects: 0,
            createdAt: block.timestamp,
            isResurrected: false,
            resurrectionNote: ""
        });

        allGraveIds.push(newGraveId);

        emit GraveCreated(newGraveId, msg.sender, _projectName);
        return newGraveId;
    }

    function deleteGrave(uint256 _graveId) external nonReentrant {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(graves[_graveId].owner == msg.sender, "Not the owner");

        delete graves[_graveId];

        for (uint256 i = 0; i < allGraveIds.length; i++) {
            if (allGraveIds[i] == _graveId) {
                allGraveIds[i] = allGraveIds[allGraveIds.length - 1];
                allGraveIds.pop();
                break;
            }
        }

        emit GraveDeleted(_graveId, msg.sender);
    }

    function resurrectGrave(uint256 _graveId, string calldata _resurrectionNote) external nonReentrant {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(graves[_graveId].owner == msg.sender, "Not the owner");

        graves[_graveId].isResurrected = true;
        graves[_graveId].resurrectionNote = _resurrectionNote;

        emit GraveResurrected(_graveId, _resurrectionNote);
    }

    function pressF(uint256 _graveId) external nonReentrant {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(!hasRespected[_graveId][msg.sender], "Already paid respects");

        graves[_graveId].respects++;
        hasRespected[_graveId][msg.sender] = true;

        emit GraveRespected(_graveId, msg.sender, true);
    }

    function unpressF(uint256 _graveId) external nonReentrant {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(hasRespected[_graveId][msg.sender], "Have not paid respects");

        graves[_graveId].respects--;
        hasRespected[_graveId][msg.sender] = false;

        emit GraveRespected(_graveId, msg.sender, false);
    }

    function dropEulogy(uint256 _graveId, string calldata _text) external nonReentrant {
        require(graves[_graveId].id != 0, "Grave does not exist");
        bytes memory tBytes = bytes(_text);
        require(tBytes.length > 0 && tBytes.length <= 500, "Eulogy length invalid");
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

    function deleteEulogy(uint256 _graveId, uint256 _eulogyId) external nonReentrant {
        require(graves[_graveId].id != 0, "Grave does not exist");
        bool found = false;

        for (uint256 i = 0; i < graveEulogies[_graveId].length; i++) {
            if (graveEulogies[_graveId][i].id == _eulogyId) {
                require(
                    graveEulogies[_graveId][i].author == msg.sender || graves[_graveId].owner == msg.sender,
                    "Not authorized"
                );
                graveEulogies[_graveId][i] = graveEulogies[_graveId][graveEulogies[_graveId].length - 1];
                graveEulogies[_graveId].pop();
                found = true;
                break;
            }
        }

        require(found, "Eulogy not found");
        emit EulogyDeleted(_graveId, _eulogyId);
    }

    function getGrave(uint256 _graveId) external view returns (Grave memory) {
        return graves[_graveId];
    }

    function getGraveCount() external view returns (uint256) {
        return allGraveIds.length;
    }

    function getAllGraveIds() external view returns (uint256[] memory) {
        return allGraveIds;
    }

    function getGravesBatch(uint256[] calldata _ids) external view returns (Grave[] memory) {
        Grave[] memory result = new Grave[](_ids.length);
        for (uint256 i = 0; i < _ids.length; i++) {
            result[i] = graves[_ids[i]];
        }
        return result;
    }

    function getRecentGraves(uint256 _limit, uint256 _offset) external view returns (Grave[] memory) {
        uint256 total = allGraveIds.length;
        if (_offset >= total) {
            return new Grave[](0);
        }

        uint256 remaining = total - _offset;
        uint256 count = remaining < _limit ? remaining : _limit;
        Grave[] memory result = new Grave[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 id = allGraveIds[total - 1 - _offset - i];
            result[i] = graves[id];
        }

        return result;
    }

    function getEulogies(uint256 _graveId) external view returns (Eulogy[] memory) {
        return graveEulogies[_graveId];
    }

    // ---- Confession Methods ----

    function postConfession(
        string calldata _text,
        string calldata _color,
        int8 _rotation
    ) external nonReentrant returns (uint256) {
        bytes memory tBytes = bytes(_text);
        require(tBytes.length > 0 && tBytes.length <= 280, "Confession length invalid");

        _confessionIds++;
        uint256 newConfessionId = _confessionIds;

        confessions[newConfessionId] = Confession({
            id: newConfessionId,
            author: msg.sender,
            text: _text,
            color: _color,
            rotation: _rotation,
            createdAt: block.timestamp,
            skulls: 0,
            candles: 0
        });

        allConfessionIds.push(newConfessionId);

        emit ConfessionPosted(newConfessionId, msg.sender);
        return newConfessionId;
    }

    function reactConfession(uint256 _id, bool _isCandle) external nonReentrant {
        require(confessions[_id].id != 0, "Confession does not exist");

        if (_isCandle) {
            require(!hasReactedCandle[_id][msg.sender], "Already lit candle");
            hasReactedCandle[_id][msg.sender] = true;
            confessions[_id].candles++;
        } else {
            require(!hasReactedSkull[_id][msg.sender], "Already gave skull");
            hasReactedSkull[_id][msg.sender] = true;
            confessions[_id].skulls++;
        }

        emit ConfessionReacted(_id, msg.sender, _isCandle);
    }

    function getConfession(uint256 _id) external view returns (Confession memory) {
        return confessions[_id];
    }

    function getConfessionCount() external view returns (uint256) {
        return allConfessionIds.length;
    }

    function getConfessions(uint256 _limit, uint256 _offset) external view returns (Confession[] memory) {
        uint256 total = allConfessionIds.length;
        if (_offset >= total) {
            return new Confession[](0);
        }

        uint256 remaining = total - _offset;
        uint256 count = remaining < _limit ? remaining : _limit;
        Confession[] memory result = new Confession[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 id = allConfessionIds[total - 1 - _offset - i];
            result[i] = confessions[id];
        }

        return result;
    }

    // ---- Social Graph Methods ----

    function follow(address _target) external nonReentrant {
        require(profiles[msg.sender].exists, "Must have profile");
        require(profiles[_target].exists, "Target profile must exist");
        require(_target != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][_target], "Already following");

        isFollowing[msg.sender][_target] = true;
        _following[msg.sender].push(_target);
        _followers[_target].push(msg.sender);

        emit Followed(msg.sender, _target);
    }

    function unfollow(address _target) external nonReentrant {
        require(isFollowing[msg.sender][_target], "Not following");

        isFollowing[msg.sender][_target] = false;

        for (uint256 i = 0; i < _following[msg.sender].length; i++) {
            if (_following[msg.sender][i] == _target) {
                _following[msg.sender][i] = _following[msg.sender][_following[msg.sender].length - 1];
                _following[msg.sender].pop();
                break;
            }
        }

        for (uint256 i = 0; i < _followers[_target].length; i++) {
            if (_followers[_target][i] == msg.sender) {
                _followers[_target][i] = _followers[_target][_followers[_target].length - 1];
                _followers[_target].pop();
                break;
            }
        }

        emit Unfollowed(msg.sender, _target);
    }

    function getFollowers(address _user) external view returns (address[] memory) {
        return _followers[_user];
    }

    function getFollowing(address _user) external view returns (address[] memory) {
        return _following[_user];
    }

    // ---- Dispatched / Shared Graves ----

    function dispatchGrave(uint256 _graveId, address _toUser) external nonReentrant {
        require(graves[_graveId].id != 0, "Grave does not exist");
        require(_toUser != address(0) && _toUser != msg.sender, "Invalid recipient");

        _dispatchIds++;
        uint256 newDispatchId = _dispatchIds;

        _dispatchedGraves[_toUser].push(DispatchedGrave({
            id: newDispatchId,
            graveId: _graveId,
            fromUser: msg.sender,
            toUser: _toUser,
            timestamp: block.timestamp
        }));

        emit GraveDispatched(newDispatchId, _graveId, msg.sender, _toUser);
    }

    function getDispatchedGraves(address _user) external view returns (DispatchedGrave[] memory) {
        return _dispatchedGraves[_user];
    }

    // ---- Internal Utilities ----

    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint256 i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}
