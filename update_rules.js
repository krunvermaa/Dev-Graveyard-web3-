const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  "allow delete: if false;",
  "allow delete: if isSignedIn() && (resource.data.fromUserId == request.auth.uid || resource.data.toUserId == request.auth.uid);"
);

rules = rules.replace(
  "allow update: if isSignedIn() && resource.data.toUserId == request.auth.uid && incoming().diff(existing()).affectedKeys().hasOnly(['status']) && existing().status == 'pending' && (incoming().status == 'accepted' || incoming().status == 'rejected');",
  "allow update: if isSignedIn() && (resource.data.fromUserId == request.auth.uid || resource.data.toUserId == request.auth.uid);"
);

rules = rules.replace(
  "allow update: if false;",
  "allow update: if isSignedIn() && (request.auth.uid == userId || request.auth.uid == friendId);"
);

fs.writeFileSync('firestore.rules', rules);
