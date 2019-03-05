import * as React from "react";
import "./App.css";

import useTrie from "@cshooks/usetrie";

const App: React.FC<{}> = () => {
  const trie = useTrie(["abcd", "bace"]);

  return (
    <div className="App">
      <header className="App-header">Trying out `useTry`</header>
      <section>
        <div>{JSON.stringify(trie, null, 2)}</div>
      </section>
    </div>
  );
};

// function App() {
//   const trie = useTrie(["abcd", "bace"]);

//   return (
//     <div className="App">
//       <header className="App-header">Trying out `useTry`</header>
//       <section>
//         <div
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(trie, null, 2) }}
//         />
//       </section>
//     </div>
//   );
// }

export default App;
