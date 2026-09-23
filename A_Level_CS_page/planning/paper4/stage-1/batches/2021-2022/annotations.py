# Manual reading annotations: part | QP page(s) | prompt summary | direct dependencies | source files | evidence type
ANNOTATIONS = {
's21_41': '''
1(a)|2|Declare the node record with integer data and nextNode fields.|||code
1(b)|3|Declare linkedList and initialise all ten node records and pointers from the page 2 table.|1(a)||code
1(c)(i)|3|Write outputNodes() to follow nextNode links and output data.|1(a),1(b)||code
1(c)(ii)|3|Call outputNodes() and capture the displayed linked-list data.|1(c)(i)||screenshot
1(d)(i)|4|Write addNode() to input data, append a node using the free list, update pointers and report success or full.|1(a),1(b)||code
1(d)(ii)|4|Call addNode(), report its result and call outputNodes() before and after the insertion.|1(c)(i),1(d)(i)||code
1(d)(iii)|4|Test insertion with the data value 5 and capture output.|1(d)(ii)||screenshot
2(a)|6|Declare global arrayData and initialise it with the ten specified integers.|||code
2(b)(i)|6|Write linearSearch() to search arrayData for an integer parameter and return a Boolean.|2(a)||code
2(b)(ii)|6|Input an integer, call linearSearch() and report whether it was found.|2(b)(i)||code
2(b)(iii)|6|Test one value present and one absent from the array; capture both results.|2(b)(ii)||screenshots
2(c)|7|Complete and implement the supplied bubble sort for descending order in arrayData.|2(a)||code
3(a)|8|Declare TreasureChest with private question, answer and points attributes; include Python attribute comments.|||code
3(b)|9|Write readData() to read five question-answer-points records, create TreasureChest objects, populate arrayTreasure and handle a missing file.|3(a)|TreasureChestData.txt|code
3(c)(i)|10|Write getQuestion() to return the stored question.|3(a)||code
3(c)(ii)|10|Write checkAnswer() to compare an answer parameter with the stored answer and return a Boolean.|3(a)||code
3(c)(iii)|10|Write getPoints() to return points according to the specified attempt-count bands.|3(a)||code
3(c)(iv)|11|Read the chests, select question 1–5, repeat until correct, count attempts and output awarded points.|3(b),3(c)(i),3(c)(ii),3(c)(iii)|TreasureChestData.txt|code
3(c)(v)|11|Capture tests answering question 1 correctly first time and question 5 correctly second time.|3(c)(iv)|TreasureChestData.txt|screenshots
''',
's22_41': '''
1(a)|2|Declare global array structure(s) for eleven player names and scores.|||code
1(b)|2|Write ReadHighScores() to load ten player-score pairs from HighScore.txt into the declared structure(s).|1(a)|HighScore.txt|code
1(c)|3|Write OutputHighScores() to display each player name and score together.|1(a)||code
1(d)(i)|3|Call ReadHighScores() then OutputHighScores() in the main program.|1(b),1(c)|HighScore.txt|code
1(d)(ii)|3|Run the program and capture the loaded high-score output.|1(d)(i)|HighScore.txt|screenshot
1(e)(i)|3|Input and validate a three-character player name and integer score from 1 to 100000 inclusive.|1(a)||code
1(e)(ii)|3|Write a procedure taking a player name and score and inserting it into the top ten if appropriate.|1(a),1(b)||code
1(e)(iii)|4|Call the insertion procedure and output the array before and after insertion.|1(c),1(e)(i),1(e)(ii)|HighScore.txt|code
1(e)(iv)|4|Test insertion using JKL and score 9999; capture output.|1(e)(iii)|HighScore.txt|screenshot
1(f)|4|Write WriteTopTen() to store the resulting top ten in NewHighScore.txt.|1(e)(ii)||code
2(a)|5|Declare Balloon with private attributes and constructor setting defence item, colour and health 100; include Python comments.|||code
2(b)|5|Implement GetDefenceItem().|2(a)||code
2(c)|6|Implement ChangeHealth() to add an integer change to health.|2(a)||code
2(d)|6|Implement CheckHealth() to return true when health is zero or less.|2(a)||code
2(e)|6|Input defence item and colour and instantiate Balloon1.|2(a)||code
2(f)|6|Write Defend() to read opponent strength, amend balloon health, display defence and health status, and return the object.|2(b),2(c),2(d)||code
2(g)(i)|7|Call Defend() from the main program and retain its returned balloon.|2(e),2(f)||code
2(g)(ii)|7|Test using Shield, Red and opponent strength 50; capture output.|2(g)(i)||screenshot
3(a)|8|Declare ten-string QueueArray with head, tail and item count initialised to zero; include Python comments.|||code
3(b)|9|Complete and implement Enqueue() from the supplied circular-queue pseudocode.|3(a)||code
3(c)|9|Write Dequeue() to return the next item, or the specified FALSE sentinel when empty.|3(a)||code
3(d)(i)|10|Input eleven strings, attempt to enqueue each and report success, then dequeue twice and display results.|3(b),3(c)||code
3(d)(ii)|10|Test with strings A through K in order and capture output.|3(d)(i)||screenshot
''',
's22_42': '''
1(a)|2|Declare global ten-integer StackData and StackPointer initialised to the next free slot zero.|||code
1(b)|2|Write a procedure displaying all ten stack elements and StackPointer.|1(a)||code
1(c)|2|Write Push() to add an integer if space exists, update the pointer and return success or full.|1(a)||code
1(d)(i)|3|Input eleven numbers, attempt each Push(), report success or full, then display the stack.|1(b),1(c)||code
1(d)(ii)|3|Test with integers 11 through 21 in order and capture output.|1(d)(i)||screenshot
1(e)(i)|3|Write Pop() to return the top element and update the pointer, or return -1 when empty.|1(a)||code
1(e)(ii)|3|After the eleven pushes, pop twice and display the updated stack; capture output.|1(d)(i),1(e)(i),1(b)||screenshot
2(a)|4|Declare a local 10-by-10 integer array and initialise every cell to a random number between 1 and 100.|||code
2(b)(i)|4|Implement the supplied three-loop bubble sort on the 2D array without built-in sorting functions.|2(a)||code
2(b)(ii)|5|Write a grid-output procedure and call it before and after the bubble sort.|2(a),2(b)(i)||code
2(b)(iii)|5|Run the sorting program and capture its output.|2(b)(ii)||screenshot
2(c)(i)|6|Complete and implement the supplied recursive BinarySearch() for the first row, including the not-found result.|2(a),2(b)(i)||code
2(c)(ii)|6|Test binary search once for a present first-row number and once for an absent one; capture returned values.|2(c)(i)||screenshot
3(a)|7|Declare Card with private Number and Colour and a constructor; include Python attribute comments.|||code
3(b)|7|Write GetNumber() and GetColour().|3(a)||code
3(c)|8|Declare a 30-element Card array and load all cards from the number-colour pairs in CardValues.txt.|3(a)|CardValues.txt|code
3(d)|8|Track previously chosen cards and write ChooseCard() to validate an available selection in the range 1–30.|3(c)||code
3(e)(i)|8|Create Player1, obtain four distinct cards using ChooseCard(), store them and output their numbers and colours.|3(b),3(c),3(d)|CardValues.txt|code
3(e)(ii)|9|Capture tests with selections 1,5,9,10 and 2,2,3,4,4,5.|3(e)(i)|CardValues.txt|screenshot
''',
'w21_41': '''
1(a)|2|Implement the supplied recursive Unknown(X,Y), preserving its outputs and integer division.|||code
1(b)(i)|3|Output parameters, call Unknown() and output the returned value for (10,15), (10,10) and (15,10).|1(a)||code
1(b)(ii)|3|Capture output for all three recursive-function calls.|1(b)(i)||screenshot
1(c)|3|Rewrite Unknown() as the iterative function IterativeUnknown().|1(a)||code
1(d)(i)|3|Call IterativeUnknown() with the same three parameter pairs and output parameters and return values.|1(c),1(b)(i)||code
1(d)(ii)|3|Capture both functions' outputs for each parameter pair.|1(b)(i),1(d)(i)||screenshots
2(a)|4|Declare Picture with private description, dimensions, frame colour and constructor; include Python comments.|||code
2(b)|4|Implement all four Picture getters.|2(a)||code
2(c)|5|Implement SetDescription() to replace the description with a parameter.|2(a)||code
2(d)|5|Declare an array of 100 Picture objects.|2(a)||code
2(e)|5|Write ReadData() to load Pictures.txt, create and store Picture objects, handle a missing file and return the number read.|2(a),2(d)|Pictures.txt|code
2(f)|5|Call ReadData() from the main program.|2(e)|Pictures.txt|code
2(g)|6|Input frame colour and maximum dimensions, search pictures case-insensitively and output matches using getters.|2(b),2(f)|Pictures.txt|code
2(h)|6|Capture searches for BLACK,100,100 and silver,25,25.|2(g)|Pictures.txt|screenshots
3(a)|8|Declare 20-by-3 ArrayNodes, RootPointer=-1 and FreeNode=0; include Python comments.|||code
3(b)|8,9|Complete and implement AddNode() using the supplied binary-tree insertion pseudocode and pointer updates.|3(a)||code
3(c)|10|Write PrintAll() to output every ArrayNodes row in left-pointer, data, right-pointer order.|3(a)||code
3(d)(i)|10|Call AddNode() ten times then PrintAll().|3(b),3(c)||code
3(d)(ii)|10|Insert 10,5,15,8,12,6,20,11,9,4 and capture the array output.|3(d)(i)||screenshot
3(e)(i)|11|Write recursive InOrder() to traverse the stored binary tree.|3(a),3(b)||code
3(e)(ii)|11|Test InOrder() with the same ten inserted values and capture output.|3(d)(ii),3(e)(i)||screenshot
''',
'w22_41': '''
1(a)|2|Declare global DataArray with space for 100 integers.|||code
1(b)|2|Write ReadFile() to load IntegerData.txt into DataArray with exception handling.|1(a)|IntegerData.txt|code
1(c)|2|Write FindValues() to validate a whole-number input from 1–100 and return its frequency in DataArray.|1(a)||code
1(d)(i)|3|Call ReadFile() and FindValues(), then output the returned frequency with a message.|1(b),1(c)|IntegerData.txt|code
1(d)(ii)|3|Test the frequency-search program with input 61 and capture output.|1(d)(i)|IntegerData.txt|screenshot
1(e)|3|Write BubbleSort() to sort DataArray and print it, and call the procedure from main.|1(a),1(b)|IntegerData.txt|code
2(a)(i)|4|Declare Card with private Number, Colour and constructor; omit getters and include Python comments.|||code
2(a)(ii)|4|Implement GetNumber() and GetColour().|2(a)(i)||code
2(a)(iii)|5|Instantiate the fifteen cards specified in the number-colour table.|2(a)(i)||code
2(b)(i)|6|Declare Hand with private attributes and a constructor accepting five cards; include Python comments.|2(a)(i)||code
2(b)(ii)|6|Implement GetCard() to return the Card at the given array index.|2(b)(i)||code
2(b)(iii)|6|Instantiate the two players' Hand objects using the specified five-card selections.|2(a)(iii),2(b)(i)||code
2(c)(i)|7|Implement CalculateValue() for a five-card hand using the specified colour bonuses and card numbers.|2(a)(ii),2(b)(ii)||code
2(c)(ii)|7|Calculate each player's score and output the winning player or a draw.|2(b)(iii),2(c)(i)||code
2(c)(iii)|7|Run the two-player program and capture output.|2(c)(ii)||screenshot
3(a)|8|Declare global 20-by-3 ArrayNodes and initialise all cells to -1.|||code
3(b)|8|Load the supplied binary-tree table and initialise FreeNode=6 and RootPointer=0.|3(a)||code
3(c)|9|Complete and implement recursive SearchValue(), returning an index or -1.|3(a),3(b)||code
3(d)|10|Write recursive PostOrder() using the specified left-right-root traversal.|3(a),3(b)||code
3(e)(i)|11|Search for 15, report its index or not-found message, and call PostOrder().|3(c),3(d)||code
3(e)(ii)|11|Run the tree search and traversal program and capture output.|3(e)(i)||screenshot
''',
'w22_42': '''
1(a)|2|Declare global 100-by-2 Jobs and global NumberOfJobs.|||code
1(b)|2|Write Initialise() to fill Jobs with -1 and set NumberOfJobs=0.|1(a)||code
1(c)|3|Write AddJob() to append a job-number/priority pair when space exists and output Added or Not added.|1(a)||code
1(d)|3|Initialise storage and add the five job-number/priority pairs in the specified order.|1(b),1(c)||code
1(e)|3|Write InsertionSort() to sort jobs by ascending numerical priority.|1(a)||code
1(f)|4|Write PrintArray() to output each job number and priority in the specified format.|1(a)||code
1(g)(i)|4|Call InsertionSort() then PrintArray() from main.|1(d),1(e),1(f)||code
1(g)(ii)|4|Run the job-sorting program and capture output.|1(g)(i)||screenshot
2(a)|5|Declare Character with private name and coordinates and its constructor; include Python comments.|||code
2(b)|5|Implement the three Character getters.|2(a)||code
2(c)|6|Implement ChangePosition() to add x and y changes to the coordinates.|2(a)||code
2(d)|6|Declare a ten-element Character array, load Characters.txt and store the objects.|2(a)|Characters.txt|code
2(e)|6|Input names repeatedly until an existing character is found and store its index.|2(b),2(d)|Characters.txt|code
2(f)|7|Validate A/W/S/D movement input and use ChangePosition() for the selected character.|2(c),2(e)|Characters.txt|code
2(g)(i)|7|Output the selected character's name and updated coordinates in the required format.|2(b),2(f)|Characters.txt|code
2(g)(ii)|7|Test inputs THOMAS, qui, X, A in order and capture output.|2(g)(i)|Characters.txt|screenshot
3(a)|8|Declare a global 100-integer linear Queue with appropriate initial head and tail pointers.|||code
3(b)|8|Write Enqueue() to append an integer and return success or failure.|3(a)||code
3(c)|8|Enqueue integers 1–20 in ascending order and report whether all were successfully stored.|3(b)||code
3(d)|9|Rewrite the supplied iterative queue-total function as a recursive function.|3(a)||code
3(e)(i)|9|Call the recursive total function and display its returned value.|3(c),3(d)||code
3(e)(ii)|9|Run the queue-total program and capture output.|3(e)(i)||screenshot
'''
}
