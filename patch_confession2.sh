sed -i 's/createdAt: d.createdAt?.toMillis() || Date.now()/createdAt: d.createdAt?.toMillis() || Date.now(),\n          reactions: d.reactions || {}/g' pages/Confessions.tsx
