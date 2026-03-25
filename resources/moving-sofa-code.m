(* 
Mathematica code extracted from the movingsofas-v.1.3.nb
This is the main code that powers the MovingSofas Mathematica package
*)



(* IMPORTANT NOTE: Evaluate this code before running anything else in the other sections *)

Subscript[x, 1][t_]:=RotationMatrix[t] . {Subscript[a, 1]Cos[t]+Subscript[a, 2]Sin[t]-1,-Subscript[a, 2]Cos[t]+Subscript[a, 1]Sin[t]-1/2}+{Subscript[\[Kappa], 1,1],Subscript[\[Kappa], 1,2]};
Subscript[x, 2][t_]:=RotationMatrix[t] . {-(1/4) t^2+Subscript[b, 1]t+Subscript[b, 2],1/2 t-Subscript[b, 1]-1}+{Subscript[\[Kappa], 2,1],Subscript[\[Kappa], 2,2]};
Subscript[x, 3][t_]:=RotationMatrix[t] . {Subscript[c, 1]-t,Subscript[c, 2]+t}+{Subscript[\[Kappa], 3,1],Subscript[\[Kappa], 3,2]};
Subscript[x, 4][t_]:=RotationMatrix[t] . {-(1/2)t+Subscript[d, 1]-1,-(1/4) t^2+Subscript[d, 1]t+Subscript[d, 2]}+{Subscript[\[Kappa], 4,1],Subscript[\[Kappa], 4,2]};
Subscript[x, 5][t_]:=RotationMatrix[t] . {Subscript[e, 1]Cos[t]+Subscript[e, 2]Sin[t]-1/2,-Subscript[e, 2]Cos[t]+Subscript[e, 1]Sin[t]-1}+{Subscript[\[Kappa], 5,1],Subscript[\[Kappa], 5,2]};
Subscript[x, 6][t_]:=RotationMatrix[t] . {Subscript[f, 1]Cos[t/2]+Subscript[f, 2]Sin[t/2]-1,-Subscript[f, 2]Cos[t/2]+Subscript[f, 1]Sin[t/2]-1}+{Subscript[\[Kappa], 6,1],Subscript[\[Kappa], 6,2]};

\[Mu][t_]:={Cos[t],Sin[t]};
\[Nu][t_]:={-Sin[t],Cos[t]};

Subscript[A, j_][t_]:=Collect[Simplify[Subscript[x, j][t]+\[Mu][t]+(Subscript[x, j]'[t] . \[Mu][t])\[Nu][t]],{Cos[t],Sin[t]}];
Subscript[B, j_][t_]:=Collect[Simplify[Subscript[x, j][t]+(Subscript[x, j]'[t] . \[Mu][t])\[Nu][t]],{Cos[t],Sin[t]}];
Subscript[C, j_][t_]:=Collect[Simplify[Subscript[x, j][t]+\[Nu][t]-(Subscript[x, j]'[t] . \[Nu][t])\[Mu][t]],{Cos[t],Sin[t]}];
Subscript[D, j_][t_]:=Collect[Simplify[Subscript[x, j][t]-(Subscript[x, j]'[t] . \[Nu][t])\[Mu][t]],{Cos[t],Sin[t]}];

Gerverx[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["x", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Phi]"}]},
{
RowBox[{
SubscriptBox["x", "2"], "[", "t", "]"}], 
RowBox[{"\[Phi]", "<=", "t", "<", "\[Theta]"}]},
{
RowBox[{
SubscriptBox["x", "3"], "[", "t", "]"}], 
RowBox[{"\[Theta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}]}]},
{
RowBox[{
SubscriptBox["x", "4"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}], "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}]}]},
{
RowBox[{
SubscriptBox["x", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)
GerverA[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["A", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Phi]"}]},
{
RowBox[{
SubscriptBox["A", "2"], "[", "t", "]"}], 
RowBox[{"\[Phi]", "<=", "t", "<", "\[Theta]"}]},
{
RowBox[{
SubscriptBox["A", "3"], "[", "t", "]"}], 
RowBox[{"\[Theta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}]}]},
{
RowBox[{
SubscriptBox["A", "4"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}], "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}]}]},
{
RowBox[{
SubscriptBox["A", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)
GerverB[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["B", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Phi]"}]},
{
RowBox[{
SubscriptBox["B", "2"], "[", "t", "]"}], 
RowBox[{"\[Phi]", "<=", "t", "<", "\[Theta]"}]},
{
RowBox[{
SubscriptBox["B", "3"], "[", "t", "]"}], 
RowBox[{"\[Theta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}]}]},
{
RowBox[{
SubscriptBox["B", "4"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}], "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}]}]},
{
RowBox[{
SubscriptBox["B", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)
GerverC[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["C", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Phi]"}]},
{
RowBox[{
SubscriptBox["C", "2"], "[", "t", "]"}], 
RowBox[{"\[Phi]", "<=", "t", "<", "\[Theta]"}]},
{
RowBox[{
SubscriptBox["C", "3"], "[", "t", "]"}], 
RowBox[{"\[Theta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}]}]},
{
RowBox[{
SubscriptBox["C", "4"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}], "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}]}]},
{
RowBox[{
SubscriptBox["C", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)
GerverD[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["D", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Phi]"}]},
{
RowBox[{
SubscriptBox["D", "2"], "[", "t", "]"}], 
RowBox[{"\[Phi]", "<=", "t", "<", "\[Theta]"}]},
{
RowBox[{
SubscriptBox["D", "3"], "[", "t", "]"}], 
RowBox[{"\[Theta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}]}]},
{
RowBox[{
SubscriptBox["D", "4"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Theta]"}], "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}]}]},
{
RowBox[{
SubscriptBox["D", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Phi]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

Ambix[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["x", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Beta]"}]},
{
RowBox[{
SubscriptBox["x", "6"], "[", "t", "]"}], 
RowBox[{"\[Beta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}]}]},
{
RowBox[{
SubscriptBox["x", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

AmbiA[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["A", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Beta]"}]},
{
RowBox[{
SubscriptBox["A", "6"], "[", "t", "]"}], 
RowBox[{"\[Beta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}]}]},
{
RowBox[{
SubscriptBox["A", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

AmbiB[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["B", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Beta]"}]},
{
RowBox[{
SubscriptBox["B", "6"], "[", "t", "]"}], 
RowBox[{"\[Beta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}]}]},
{
RowBox[{
SubscriptBox["B", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

AmbiC[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["C", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Beta]"}]},
{
RowBox[{
SubscriptBox["C", "6"], "[", "t", "]"}], 
RowBox[{"\[Beta]", "<=", "t", "<=", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}]}]},
{
RowBox[{
SubscriptBox["C", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

AmbiD[t_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{
SubscriptBox["D", "1"], "[", "t", "]"}], 
RowBox[{"0", "<=", "t", "<", "\[Beta]"}]},
{
RowBox[{
SubscriptBox["D", "6"], "[", "t", "]"}], 
RowBox[{"\[Beta]", "<=", "t", "<", 
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}]}]},
{
RowBox[{
SubscriptBox["D", "5"], "[", "t", "]"}], 
RowBox[{
RowBox[{
RowBox[{"\[Pi]", "/", "2"}], "-", "\[Beta]"}], "<=", "t", "<=", 
RowBox[{"\[Pi]", "/", "2"}]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

GerverEquations={
  Subscript[e, 1]==Subscript[a, 1],
  Subscript[e, 2]==-Subscript[a, 2],
  Subscript[d, 1]==\[Pi]/4-Subscript[b, 1],
  Subscript[d, 2]==Subscript[b, 2]+\[Pi]/4 (2Subscript[b, 1]-\[Pi]/4),
  Subscript[c, 2]==Subscript[c, 1]-\[Pi]/2,
  Subscript[\[Kappa], 1,1]==1-Subscript[a, 1],
  Subscript[\[Kappa], 1,2]==1/2+Subscript[a, 2],
  Subscript[\[Kappa], 1,2]==-Subscript[a, 2],
  Subscript[x, 1][\[Phi]][[1]] == Subscript[x, 2][\[Phi]][[1]],
  Subscript[x, 1][\[Phi]][[2]] == Subscript[x, 2][\[Phi]][[2]],
  Subscript[x, 1]'[\[Phi]][[1]] == Subscript[x, 2]'[\[Phi]][[1]],
  Subscript[x, 1]'[\[Phi]][[2]] == Subscript[x, 2]'[\[Phi]][[2]],
  Subscript[x, 2][\[Theta]][[1]] == Subscript[x, 3][\[Theta]][[1]],
  Subscript[x, 2][\[Theta]][[2]] == Subscript[x, 3][\[Theta]][[2]],
  Subscript[x, 2]'[\[Theta]][[1]] == Subscript[x, 3]'[\[Theta]][[1]],
  Subscript[x, 2]'[\[Theta]][[2]] == Subscript[x, 3]'[\[Theta]][[2]],
  Subscript[x, 3][\[Pi]/2-\[Theta]][[1]] == Subscript[x, 4][\[Pi]/2-\[Theta]][[1]],
  Subscript[x, 3][\[Pi]/2-\[Theta]][[2]] == Subscript[x, 4][\[Pi]/2-\[Theta]][[2]],
  Subscript[x, 3]'[\[Pi]/2-\[Theta]][[1]] == Subscript[x, 4]'[\[Pi]/2-\[Theta]][[1]],
  Subscript[x, 3]'[\[Pi]/2-\[Theta]][[2]] == Subscript[x, 4]'[\[Pi]/2-\[Theta]][[2]],
  Subscript[x, 4][\[Pi]/2-\[Phi]][[1]] == Subscript[x, 5][\[Pi]/2-\[Phi]][[1]],
  Subscript[x, 4][\[Pi]/2-\[Phi]][[2]] == Subscript[x, 5][\[Pi]/2-\[Phi]][[2]],
  Subscript[x, 4]'[\[Pi]/2-\[Phi]][[1]] == Subscript[x, 5]'[\[Pi]/2-\[Phi]][[1]],
  Subscript[x, 4]'[\[Pi]/2-\[Phi]][[2]] == Subscript[x, 5]'[\[Pi]/2-\[Phi]][[2]],
  Subscript[x, 1][\[Phi]][[1]] == Subscript[B, 3][\[Pi]/2-\[Theta]][[1]],
  Subscript[x, 1][\[Phi]][[2]] == Subscript[B, 3][\[Pi]/2-\[Theta]][[2]],
  Subscript[x, 5][\[Pi]/2-\[Phi]][[1]] == Subscript[D, 2][\[Theta]][[1]],
  Subscript[x, 5][\[Pi]/2-\[Phi]][[2]] == Subscript[D, 2][\[Theta]][[2]]
};

AmbidextrousEquations={
  (* equation (48) in the paper *) Subscript[e, 1]==Subscript[a, 1], 
  (* equation (49) in the paper *) Subscript[e, 2]==-Subscript[a, 2],
  (* equation (50) in the paper *) Subscript[f, 2]==(1-Sqrt[2])Subscript[f, 1],
  (* equation (51) in the paper *) Subscript[\[Kappa], 1,1]==1-Subscript[a, 1],
  (* equation (52) in the paper *) Subscript[\[Kappa], 1,2]==1/2+Subscript[a, 2],
  (* equation (53) in the paper *) Subscript[\[Kappa], 1,2]==1/2-Subscript[a, 2],
  (* x-component of equation (54) in the paper *) Subscript[x, 1][\[Beta]][[1]] == Subscript[x, 6][\[Beta]][[1]],
  (* y-component of equation (54) in the paper *) Subscript[x, 1][\[Beta]][[2]] == Subscript[x, 6][\[Beta]][[2]],
  (* x-component of equation (55) in the paper *) Subscript[x, 1]'[\[Beta]][[1]] == Subscript[x, 6]'[\[Beta]][[1]],
  (* y-component of equation (55) in the paper *) Subscript[x, 1]'[\[Beta]][[2]] == Subscript[x, 6]'[\[Beta]][[2]],
  (* x-component of equation (56) in the paper *) Subscript[x, 6][\[Pi]/2-\[Beta]][[1]] == Subscript[x, 5][\[Pi]/2-\[Beta]][[1]],
  (* y-component of equation (56) in the paper *) Subscript[x, 6][\[Pi]/2-\[Beta]][[2]] == Subscript[x, 5][\[Pi]/2-\[Beta]][[2]],
  (* x-component of equation (57) in the paper *) Subscript[x, 6]'[\[Pi]/2-\[Beta]][[1]] == Subscript[x, 5]'[\[Pi]/2-\[Beta]][[1]],
  (* y-component of equation (57) in the paper *) Subscript[x, 6]'[\[Pi]/2-\[Beta]][[2]] == Subscript[x, 5]'[\[Pi]/2-\[Beta]][[2]],
  (* x-component of equation (58) in the paper *) Subscript[x, 1][\[Beta]][[1]] == Subscript[B, 1][\[Beta]][[1]],
  (* y-component of equation (58) in the paper *) Subscript[x, 1][\[Beta]][[2]] == Subscript[B, 1][\[Beta]][[2]],
  (* x-component of equation (59) in the paper *) Subscript[x, 5][\[Pi]/2-\[Beta]][[1]] == Subscript[D, 2][\[Pi]/2-\[Beta]][[1]],
  (* y-component of equation (59) in the paper *) Subscript[x, 5][\[Pi]/2-\[Beta]][[2]] == Subscript[D, 2][\[Pi]/2-\[Beta]][[2]],
  (* equation (60) in the paper *) Subscript[x, 1]'[\[Beta]] . \[Mu][\[Beta]]==0
};

GerverAngle\[Phi]=0.0391773647900836418632178752424;
GerverAngle\[Theta]=0.681301509382724894473855757083;
GerverPrecomputedNumericalArea=2.21953166887196742554628410079679;
  
GerverPrecomputedNumericalConstants= {
  \[Phi]->0.0391773647900836418632178752424, 
  \[Theta]->0.681301509382724894473855757083, 
  Subscript[\[Kappa], 1,1]->-0.210322422072688751416185718488, 
  Subscript[\[Kappa], 1,2]->1/4, 
  Subscript[\[Kappa], 2,1]->-0.919179292771593322274696102894,
  Subscript[\[Kappa], 2,2]->0.472406619750805465181760762512,
  Subscript[\[Kappa], 3,1]->-0.613763229430251668554914291318,
  Subscript[\[Kappa], 3,2]->0.889626479003221860727043050048, 
  Subscript[\[Kappa], 4,1]->-0.308347166088910014835132479741,
  Subscript[\[Kappa], 4,2]->0.472406619750805465181760762512,
  Subscript[\[Kappa], 5,1]->-1.01720403678781458569364286415,
  Subscript[\[Kappa], 5,2]->1/4,
  Subscript[a, 1]->1.21032242207268875141618571849,
  Subscript[a, 2]->-1/4,
  Subscript[b, 1]->-0.527624598026784624160503809373,
  Subscript[b, 2]->0.920258385160637622893705795012,
  Subscript[c, 1]->0.626045522848465867552329310386,
  Subscript[c, 2]->-0.944750803946430751678992381254,
  Subscript[d, 1]->1.31302276142423293377616465519,
  Subscript[d, 2]->-0.525382670414554437202836294305,
  Subscript[e, 1]->1.21032242207268875141618571849,
  Subscript[e, 2]->1/4
};

AmbidextrousAngle\[Beta]=0.289653820817320941743521611736;

AmbidextrousPrecomputedNumericalConstants = {
  \[Beta]->0.289653820817320941743521611736,
  Subscript[\[Kappa], 1,1]->0.124712637587267758739932415305,
  Subscript[\[Kappa], 1,2]->1/2,
  Subscript[\[Kappa], 6,1]->-0.167049816550309655013423446260,
  Subscript[\[Kappa], 6,2]->1/2,
  Subscript[\[Kappa], 5,1]->-0.458812270687887068766779307825,
  Subscript[\[Kappa], 5,2]->1/2,
  Subscript[a, 1]->0.875287362412732241260067584695,
  Subscript[a, 2]->0,
  Subscript[f, 1]->1.20293890815691138907022280034,
  Subscript[f, 2]->-0.498273610464875672029397859080,
  Subscript[e, 1]->0.875287362412732241260067584695,
  Subscript[e, 2]->0
};


AmbidextrousSymbolicBeta=ArcTan[1/2 ((Sqrt[2]+1)^(1/3)-(Sqrt[2]-1)^(1/3))];
AmbidextrousSymbolicBetaAlternative=ArcTan[(Sqrt[2]+1)^(1/3)]-ArcTan[(Sqrt[2]-1)^(1/3)];
AmbidextrousSymbolicTanBeta=1/2 ((Sqrt[2]+1)^(1/3)-(Sqrt[2]-1)^(1/3));
AmbidextrousSymbolicCosineBeta=1/2 (-Sqrt[2]+(2 (-4+3 Sqrt[2]))^(1/3)+(2 (4+3 Sqrt[2]))^(1/3));
AmbidextrousSymbolicCosineBetaOverTwo=1/2 Sqrt[2-Sqrt[2]+(2 (-4+3 Sqrt[2]))^(1/3)+(2 (4+3 Sqrt[2]))^(1/3)];
AmbidextrousSymbolicSineBetaOverTwo=1/2 Sqrt[2+Sqrt[2]-(2 (-4+3 Sqrt[2]))^(1/3)-(2 (4+3 Sqrt[2]))^(1/3)];
AmbidextrousSymbolicaOne=1/4 Sqrt[4+(71+8Sqrt[2])^(1/3)+(71-8Sqrt[2])^(1/3)];
AmbidextrousSymbolicKappaOneOne=1-AmbidextrousSymbolicaOne;
AmbidextrousSymbolicKappaSixOne=1-4/3 AmbidextrousSymbolicaOne;
AmbidextrousSymbolicKappaFiveOne=1-5/3 AmbidextrousSymbolicaOne;
AmbidextrousSymbolicfOne=1/(3Sqrt[2(2-Sqrt[2])]) (83+(420619+15104 Sqrt[2])^(1/3)+(420619-15104 Sqrt[2])^(1/3))^(1/4);
AmbidextrousSymbolicfTwo=-(Sqrt[2-Sqrt[2]]/6) (83+(420619+15104 Sqrt[2])^(1/3)+(420619-15104 Sqrt[2])^(1/3))^(1/4);
AmbidextrousSymbolicAreaMinusBeta=(3-2 Sqrt[2])^(1/3)+(3+2 Sqrt[2])^(1/3)-1;
AmbidextrousSymbolicArea=(3+2 Sqrt[2])^(1/3)+(3-2 Sqrt[2])^(1/3)-1+ArcTan[1/2 ((Sqrt[2]+1)^(1/3)-(Sqrt[2]-1)^(1/3))];
AmbidextrousSymbolicaSofaLength=2/3 Sqrt[4+(71+8Sqrt[2])^(1/3)+(71-8Sqrt[2])^(1/3)];


GerverxNumerical:=Function[t,Gerverx[t]/.GerverPrecomputedNumericalConstants];
GerverANumerical:=Function[t,GerverA[t]/.GerverPrecomputedNumericalConstants];
GerverBNumerical:=Function[t,GerverB[t]/.GerverPrecomputedNumericalConstants];
GerverCNumerical:=Function[t,GerverC[t]/.GerverPrecomputedNumericalConstants];
GerverDNumerical:=Function[t,GerverD[t]/.GerverPrecomputedNumericalConstants];

AmbixNumerical:=Function[t,Ambix[t]/.AmbidextrousPrecomputedNumericalConstants];
AmbiANumerical:=Function[t,AmbiA[t]/.AmbidextrousPrecomputedNumericalConstants];
AmbiBNumerical:=Function[t,AmbiB[t]/.AmbidextrousPrecomputedNumericalConstants];
AmbiCNumerical:=Function[t,AmbiC[t]/.AmbidextrousPrecomputedNumericalConstants];
AmbiDNumerical:=Function[t,AmbiD[t]/.AmbidextrousPrecomputedNumericalConstants];

SofaDefaultNumSubdivisionPoints=300;
SofaDefaultFillingColor=RGBColor[1,1,0.87];
SofaHallwayDefaultFillingColor=GrayLevel[0.75];
SquareSofaDefaultFillingColor=RGBColor[0.95,1,0.9];
SemicircleSofaDefaultFillingColor=RGBColor[1,1,0.85];
HammersleySofaDefaultFillingColor=RGBColor[0.9,0.9,1];
GerverSofaDefaultFillingColor=RGBColor[0.9,0.83,1];
AmbidextrousSofaDefaultFillingColor=RGBColor[1,0.8,0.7];

SofaHallway[armlength_]:={
  EdgeForm[None],
  SofaHallwayDefaultFillingColor,
  AbsoluteThickness[1.5],
    Polygon[{{-armlength,0},{0,0},{0,-armlength},{1,-armlength},{1,1},{-armlength,1}}],
  {Black,Line[{{-armlength,0},{0,0},{0,-armlength}}],
         Line[{{-armlength,1},{1,1},{1,-armlength}}]}
};

SofaHallwayTwoCorners[armlength_]:={
  EdgeForm[None],
  SofaHallwayDefaultFillingColor,
  AbsoluteThickness[1.5],
    Polygon[{{-armlength,0},{0,0},{0,-armlength},{armlength+1,-armlength},{armlength+1,-armlength+1},{1,-armlength+1},{1,1},{-armlength,1}}],
  {Black,Line[{{-armlength,0},{0,0},{0,-armlength},{armlength+1,-armlength}}],
         Line[{{-armlength,1},{1,1},{1,-armlength+1},{armlength+1,-armlength+1}}]}
};

SquareSofa={
  EdgeForm[{Black,AbsoluteThickness[2]}],
  SofaDefaultFillingColor,
  Polygon[{{0,0},{1,0},{1,1},{0,1}}]
};

SemicircleSofa={
  EdgeForm[{Black,AbsoluteThickness[2]}],
  SofaDefaultFillingColor,
  Disk[{0,0},1,{0,\[Pi]}]
};

SemicircleSofaRotationPath:=Function[t,{0,0}];

HammersleyGeneralizedSofa[innerradius_]:={
  EdgeForm[{Black,AbsoluteThickness[1.5]}],
  SofaDefaultFillingColor,
  If[innerradius==0,SemicircleSofa,
    Polygon[
      Join[
        Table[{Cos[t],Sin[t]},{t,0.0,\[Pi]/2-10^-8,(\[Pi]/2)/SofaDefaultNumSubdivisionPoints}],
        {{0,1},{-2innerradius,1}},
        Table[{-2innerradius+Cos[t],Sin[t]},{t,\[Pi]/2,\[Pi]-10^-8,(\[Pi]/2)/SofaDefaultNumSubdivisionPoints}],
        {{-2innerradius,0},{-2innerradius,0}},
        Table[{-innerradius+innerradius Cos[t],innerradius Sin[t]},
                   {t,\[Pi]-\[Pi]/Ceiling[innerradius*SofaDefaultNumSubdivisionPoints],0,-(\[Pi]/Ceiling[innerradius*SofaDefaultNumSubdivisionPoints])}]
      ]
    ]
  ]
};

HammersleySofa:=HammersleyGeneralizedSofa[2/\[Pi]];

HammersleyGeneralizedSofaRotationPath[innerradius_]:=Function[t,{-innerradius+innerradius Cos[2t],innerradius Sin[2t]}];

HammersleySofaRotationPath:=Function[t,{-(2/\[Pi])+2/\[Pi] Cos[2t],2/\[Pi] Sin[2t]}];

HammersleyGeneralizedSofaArea[r_]:=\[Pi]/2+r(2-\[Pi]/2 r);

HammersleyGeneralizedSofaContactPoints[r_,angle_]:={
  {0,0},
  {-2r,0},
  r{Cos[2angle]-1,Sin[2angle]},
  {Cos[angle],Sin[angle]},
  {-2r-Sin[angle],Cos[angle]}
};

HammersleySofaContactPoints[angle_]:={
  {0,0},
  {-4/\[Pi],0},
  2/\[Pi] {Cos[2angle]-1,Sin[2angle]},
  {Cos[angle],Sin[angle]},
  {-4/\[Pi]-Sin[angle],Cos[angle]}
};

SofaRotatedWithHallwayGraphics[armlength_,sofagraphics_,rotationpath_,angle_]:=Graphics[{
  SofaHallway[armlength],
  Rotate[Translate[sofagraphics,-rotationpath[angle]],-angle,{0,0}]
}];

SofaWithRotatedHallwayGraphics[armlength_,sofagraphics_,rotationpath_,angle_,plotrange_]:=Graphics[{
  Translate[Rotate[SofaHallway[armlength],angle,{0,0}],rotationpath[angle]],
  sofagraphics
},PlotRange->plotrange];

SofaMovieWithHallway[armlength_,xinitial_,sofagraphics_,rotationpath_,time_]:=Graphics[{
  SofaHallway[armlength],
  If[time<=1,Translate[sofagraphics,{-xinitial*(1-time),0}],
    If[time<=2,Rotate[Translate[sofagraphics,-rotationpath[\[Pi]/2 (time-1)]],-(\[Pi]/2)(time-1),{0,0}],
      Translate[Rotate[Translate[sofagraphics,-rotationpath[\[Pi]/2]],-(\[Pi]/2),{0,0}],
          {0,-xinitial*(time-2)}]
    ]
  ]
}];

SofaMovieWithHallwayTwoCorners[armlength_,leftendpoint_,sofagraphics_,rotationpath_,time_]:=Module[{basebpoint,xinitial},
xinitial=armlength+leftendpoint;
Graphics[{
  SofaHallwayTwoCorners[armlength],
  If[time<=1,Translate[sofagraphics,{-xinitial*(1-time),0}],
    If[time<=2,Rotate[Translate[sofagraphics,-rotationpath[\[Pi]/2 (time-1)]],-(\[Pi]/2)(time-1),{0,0}],
      If[time<=3,Translate[Rotate[Translate[sofagraphics,-rotationpath[\[Pi]/2]],-(\[Pi]/2),{0,0}],
          {0,-xinitial*(time-2)}],
        If[time<=4,
            basepoint=rotationpath[\[Pi]/2 (4-time)];
            basepoint[[1]]=rotationpath[\[Pi]/2][[1]]-basepoint[[1]]; basepoint[[2]]=1-basepoint[[2]];
            Translate[Rotate[Translate[sofagraphics,-basepoint],-(\[Pi]/2)(4-time),{0,0}],{1,-armlength+1}],
          If[time<=5,Translate[sofagraphics,{-rotationpath[\[Pi]/2][[1]]+1+xinitial*(time-4),-armlength}],{}]
         ]
       ]
     ]
   ]
}]];

GerverSofaCurveSegment1=Table[GerverxNumerical[t],{t,GerverAngle\[Phi],\[Pi]/2-GerverAngle\[Phi],(\[Pi]/2-GerverAngle\[Phi])/Floor[SofaDefaultNumSubdivisionPoints/5]}];
GerverSofaCurveSegment2=Table[GerverDNumerical[t],{t,GerverAngle\[Theta],0,-(\[Pi]/2-GerverAngle\[Theta])/Floor[SofaDefaultNumSubdivisionPoints/5]}];
GerverSofaCurveSegment3=Table[GerverCNumerical[t],{t,\[Pi]/2,GerverAngle\[Phi],-(\[Pi]/2-GerverAngle\[Phi])/Floor[SofaDefaultNumSubdivisionPoints/5]}];
GerverSofaCurveSegment4=Table[GerverANumerical[t],{t,\[Pi]/2,GerverAngle\[Phi],-(\[Pi]/2-GerverAngle\[Phi])/Floor[SofaDefaultNumSubdivisionPoints/5]}];
GerverSofaCurveSegment5=Table[GerverBNumerical[t],{t,\[Pi]/2,\[Pi]/2-GerverAngle\[Theta],-GerverAngle\[Theta]/Floor[SofaDefaultNumSubdivisionPoints/5]}];
GerverSofaCurveSegmentsCombined=Join[GerverSofaCurveSegment1,GerverSofaCurveSegment2,GerverSofaCurveSegment3,GerverSofaCurveSegment4,GerverSofaCurveSegment5];
GerverSofaRotationPathDashedSegment1=Table[GerverxNumerical[t],{t,0,GerverAngle\[Phi],GerverAngle\[Phi]/Floor[SofaDefaultNumSubdivisionPoints/5]}];
GerverSofaRotationPathDashedSegment2=Table[GerverxNumerical[t],{t,\[Pi]/2-GerverAngle\[Phi],\[Pi]/2,GerverAngle\[Phi]/Floor[SofaDefaultNumSubdivisionPoints/5]}];

GerverSofa:={
  EdgeForm[{Black,AbsoluteThickness[1.5]}],
  SofaDefaultFillingColor,
  Polygon[GerverSofaCurveSegmentsCombined]
};

GerverSofaRotationPathDashedSegments:={
  AbsoluteThickness[1.5],Dashing[Tiny],Black,Line[GerverSofaRotationPathDashedSegment1],Line[GerverSofaRotationPathDashedSegment2]
};

GerverSofaRotationPath:=Function[t,GerverxNumerical[t]];

GerverSofaNormalTickMarkData = {
{GerverxNumerical[GerverAngle\[Phi]],-{Sin[GerverAngle\[Theta]],Cos[GerverAngle\[Theta]]}},
{GerverxNumerical[GerverAngle\[Theta]],-{Cos[1.35],Sin[1.35]}},
{GerverxNumerical[\[Pi]/2-GerverAngle\[Theta]],{Cos[1.35],-Sin[1.35]}},
{GerverxNumerical[\[Pi]/2-GerverAngle\[Phi]],{Sin[GerverAngle\[Theta]],-Cos[GerverAngle\[Theta]]}},{GerverBNumerical[\[Pi]/2-GerverAngle\[Phi]],-{Cos[\[Pi]/2-GerverAngle\[Phi]],Sin[\[Pi]/2-GerverAngle\[Phi]]}},
{GerverBNumerical[\[Pi]/2],{0,-1}},
{GerverDNumerical[GerverAngle\[Phi]],{Sin[GerverAngle\[Phi]],-Cos[GerverAngle\[Phi]]}},
{GerverDNumerical[0],{0,-1}},
{GerverANumerical[GerverAngle\[Theta]],{Cos[GerverAngle\[Theta]],Sin[GerverAngle\[Theta]]}},
{GerverANumerical[\[Pi]/2-GerverAngle\[Theta]],{Cos[\[Pi]/2-GerverAngle\[Theta]],Sin[\[Pi]/2-GerverAngle\[Theta]]}},
{GerverANumerical[\[Pi]/2-GerverAngle\[Phi]],{Cos[\[Pi]/2-GerverAngle\[Phi]],Sin[\[Pi]/2-GerverAngle\[Phi]]}},
{GerverANumerical[\[Pi]/2],{0,1}},
{GerverCNumerical[\[Pi]/2-GerverAngle\[Theta]],{-Sin[\[Pi]/2-GerverAngle\[Theta]],Cos[\[Pi]/2-GerverAngle\[Theta]]}},
{GerverCNumerical[GerverAngle\[Theta]],{-Sin[GerverAngle\[Theta]],Cos[GerverAngle\[Theta]]}},
{GerverCNumerical[GerverAngle\[Phi]],{-Cos[\[Pi]/2-GerverAngle\[Phi]],Sin[\[Pi]/2-GerverAngle\[Phi]]}},
{GerverCNumerical[0],{0,1}},
{{1,0},{0.707,-0.707}},
{GerverCNumerical[\[Pi]/2],-{0.707,0.707}}
};

GerverSofaNormalTickMarks={Black,Map[Line[{#[[1]]-0.03(#[[2]]/Norm[#[[2]]]),#[[1]]+0(#[[2]]/Norm[#[[2]]])}]&,GerverSofaNormalTickMarkData]};

GerverSofaContactPoints[angle_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{"{", 
RowBox[{
RowBox[{"{", 
RowBox[{"1", ",", "0"}], "}"}], ",", 
RowBox[{"GerverCNumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverDNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{"angle", "<", "GerverAngle\[Phi]"}]},
{
RowBox[{"{", 
RowBox[{
RowBox[{"GerverxNumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverANumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverCNumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverDNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{"GerverAngle\[Phi]", "<=", "angle", "<=", "GerverAngle\[Theta]"}]},
{
RowBox[{"{", 
RowBox[{
RowBox[{"GerverxNumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverANumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverCNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{"GerverAngle\[Theta]", "<", "angle", "<", 
RowBox[{
FractionBox["\[Pi]", "2"], "-", "GerverAngle\[Theta]"}]}]},
{
RowBox[{"{", 
RowBox[{
RowBox[{"GerverxNumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverANumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverBNumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverCNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{
RowBox[{
FractionBox["\[Pi]", "2"], "-", "GerverAngle\[Theta]"}], "<=", "angle", "<=", 
RowBox[{
FractionBox["\[Pi]", "2"], "-", "GerverAngle\[Phi]"}]}]},
{
RowBox[{"{", 
RowBox[{
RowBox[{"GerverANumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverBNumerical", "[", "angle", "]"}], ",", 
RowBox[{"GerverCNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{
RowBox[{
FractionBox["\[Pi]", "2"], "-", "GerverAngle\[Phi]"}], "<", "angle", "<=", 
FractionBox["\[Pi]", "2"]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

AmbiReflection[pt_]:={pt[[1]],1-pt[[2]]};
AmbidextrousSofaCurveSegment1=Rest[Table[AmbixNumerical[t],{t,AmbidextrousAngle\[Beta],\[Pi]/2-AmbidextrousAngle\[Beta],(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}]];
AmbidextrousSofaCurveSegment2=Table[AmbiDNumerical[t],{t,\[Pi]/2-AmbidextrousAngle\[Beta],0,-(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}];
AmbidextrousSofaCurveSegment3=Table[AmbiReflection[AmbiCNumerical[t]],{t,0,\[Pi]/2-AmbidextrousAngle\[Beta],(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}];
AmbidextrousSofaCurveSegment4=Table[AmbiCNumerical[t],{t,\[Pi]/2-AmbidextrousAngle\[Beta],0,-(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}];
AmbidextrousSofaCurveSegment5=Table[AmbiReflection[AmbiDNumerical[t]],{t,0,\[Pi]/2-AmbidextrousAngle\[Beta],(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}];
AmbidextrousSofaCurveSegment6=Most[Table[AmbiReflection[AmbixNumerical[t]],{t,\[Pi]/2-AmbidextrousAngle\[Beta],AmbidextrousAngle\[Beta],-(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}]];
AmbidextrousSofaCurveSegment7=Rest[Table[AmbiReflection[AmbiBNumerical[t]],{t,AmbidextrousAngle\[Beta],\[Pi]/2,(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}]];
AmbidextrousSofaCurveSegment8=Append[Most[Table[AmbiANumerical[t],{t,\[Pi]/2,AmbidextrousAngle\[Beta],-(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}]],{1,1/2}];
AmbidextrousSofaCurveSegment9=Rest[Table[AmbiReflection[AmbiANumerical[t]],{t,AmbidextrousAngle\[Beta],\[Pi]/2,(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}]];
AmbidextrousSofaCurveSegment10=Most[Table[AmbiBNumerical[t],{t,\[Pi]/2,AmbidextrousAngle\[Beta],-(\[Pi]/2-AmbidextrousAngle\[Beta])/Floor[SofaDefaultNumSubdivisionPoints/3]}]];

AmbidextrousSofaRotationPathDashedSegment1=Most[Table[AmbixNumerical[t],{t,0,AmbidextrousAngle\[Beta],AmbidextrousAngle\[Beta]/Floor[SofaDefaultNumSubdivisionPoints/3]}]];
AmbidextrousSofaRotationPathDashedSegment2=Table[AmbixNumerical[t],{t,\[Pi]/2-AmbidextrousAngle\[Beta],\[Pi]/2,AmbidextrousAngle\[Beta]/Floor[SofaDefaultNumSubdivisionPoints/3]}];

AmbidextrousSofaCurveSegmentsCombined=Join[AmbidextrousSofaCurveSegment1,AmbidextrousSofaCurveSegment2,AmbidextrousSofaCurveSegment3,AmbidextrousSofaCurveSegment4,AmbidextrousSofaCurveSegment5,AmbidextrousSofaCurveSegment6,AmbidextrousSofaCurveSegment7,AmbidextrousSofaCurveSegment8,AmbidextrousSofaCurveSegment9,AmbidextrousSofaCurveSegment10];

AmbidextrousSofa:={
  EdgeForm[{Black,AbsoluteThickness[1.5]}],
  SofaDefaultFillingColor,
  Polygon[AmbidextrousSofaCurveSegmentsCombined]
};

AmbidextrousSofaRotationPathDashedSegments:={
  AbsoluteThickness[1.5],Dashing[Tiny],Black,Line[AmbidextrousSofaRotationPathDashedSegment1],Line[AmbidextrousSofaRotationPathDashedSegment2]
};

OneSidedAmbidextrousSofaCurve=Join[AmbidextrousSofaCurveSegment1,AmbidextrousSofaCurveSegment2,{{AmbidextrousSofaCurveSegment4[[1]][[1]],0}},AmbidextrousSofaCurveSegment4,AmbidextrousSofaCurveSegment8,{{1,0}},AmbidextrousSofaCurveSegment10];

OneSidedAmbidextrousSofa:={
  EdgeForm[{Black,AbsoluteThickness[1.5]}],
  SofaDefaultFillingColor,
  Polygon[OneSidedAmbidextrousSofaCurve]
};

OneSidedAmbidextrousSofaWithReflection:={
  EdgeForm[{Black,AbsoluteThickness[1.5]}],
  SofaDefaultFillingColor,
  Polygon[OneSidedAmbidextrousSofaCurve],
  {Black,Dashed,
   Line[AmbidextrousSofaCurveSegment3],
   Line[Join[AmbidextrousSofaCurveSegment5,
             AmbidextrousSofaCurveSegment6,
             AmbidextrousSofaCurveSegment7]],
   Line[AmbidextrousSofaCurveSegment9],
   Line[{{AmbiCNumerical[\[Pi]/2][[1]],1/2},{1,1/2}}]}
};


AmbidextrousSofaContactPoints[angle_]:=\!\(\*
TagBox[GridBox[{
{"\[Piecewise]", GridBox[{
{
RowBox[{"{", 
RowBox[{
RowBox[{"{", 
RowBox[{"1", ",", 
RowBox[{"1", "/", "2"}]}], "}"}], ",", 
RowBox[{"AmbiCNumerical", "[", "angle", "]"}], ",", 
RowBox[{"AmbiDNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{"angle", "<", "AmbidextrousAngle\[Beta]"}]},
{
RowBox[{"{", 
RowBox[{
RowBox[{"AmbixNumerical", "[", "angle", "]"}], ",", 
RowBox[{"AmbiANumerical", "[", "angle", "]"}], ",", 
RowBox[{"AmbiBNumerical", "[", "angle", "]"}], ",", 
RowBox[{"AmbiCNumerical", "[", "angle", "]"}], ",", 
RowBox[{"AmbiDNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{"AmbidextrousAngle\[Beta]", "<", "angle", "<", 
RowBox[{
FractionBox["\[Pi]", "2"], "-", "AmbidextrousAngle\[Beta]"}]}]},
{
RowBox[{"{", 
RowBox[{
RowBox[{"AmbiANumerical", "[", "angle", "]"}], ",", 
RowBox[{"AmbiBNumerical", "[", "angle", "]"}], ",", 
RowBox[{"AmbiCNumerical", "[", "angle", "]"}]}], "}"}], 
RowBox[{
RowBox[{
FractionBox["\[Pi]", "2"], "-", "AmbidextrousAngle\[Beta]"}], "<", "angle", "<=", 
FractionBox["\[Pi]", "2"]}]}
},
AllowedDimensions->{2, Automatic},
Editable->True,
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.84]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}},
Selectable->True]}
},
GridBoxAlignment->{"Columns" -> {{Left}}, "ColumnsIndexed" -> {}, "Rows" -> {{Baseline}}, "RowsIndexed" -> {}},
GridBoxItemSize->{"Columns" -> {{Automatic}}, "ColumnsIndexed" -> {}, "Rows" -> {{1.}}, "RowsIndexed" -> {}},
GridBoxSpacings->{"Columns" -> {Offset[0.27999999999999997`], {Offset[0.35]}, Offset[0.27999999999999997`]}, "ColumnsIndexed" -> {}, "Rows" -> {Offset[0.2], {Offset[0.4]}, Offset[0.2]}, "RowsIndexed" -> {}}],
"Piecewise",
DeleteWithContents->True,
Editable->False,
SelectWithContents->True,
Selectable->False]\)

AmbidextrousSofaRotationPath:=Function[t,AmbixNumerical[t]];

AmbidextrousSofaNormalTickMarkData = {
  {AmbixNumerical[AmbidextrousAngle\[Beta]],-{Cos[AmbidextrousAngle\[Beta]],Sin[AmbidextrousAngle\[Beta]]}},
  {AmbixNumerical[\[Pi]/2-AmbidextrousAngle\[Beta]],{Sin[\[Pi]/2-AmbidextrousAngle\[Beta]],-Cos[\[Pi]/2-AmbidextrousAngle\[Beta]]}},
  {AmbiReflection[AmbixNumerical[AmbidextrousAngle\[Beta]]],-{Cos[AmbidextrousAngle\[Beta]],-Sin[AmbidextrousAngle\[Beta]]}},
  {AmbiReflection[AmbixNumerical[\[Pi]/2-AmbidextrousAngle\[Beta]]],{Sin[\[Pi]/2-AmbidextrousAngle\[Beta]],Cos[\[Pi]/2-AmbidextrousAngle\[Beta]]}},
  {AmbiDNumerical[AmbidextrousAngle\[Beta]],{Sin[AmbidextrousAngle\[Beta]],-Cos[AmbidextrousAngle\[Beta]]}},
  {AmbiReflection[AmbiDNumerical[AmbidextrousAngle\[Beta]]],{Sin[AmbidextrousAngle\[Beta]],Cos[AmbidextrousAngle\[Beta]]}},
  {AmbiDNumerical[0],{0,-1}},
  {AmbiReflection[AmbiDNumerical[0]],{0,1}},
  {AmbiBNumerical[\[Pi]/2-AmbidextrousAngle\[Beta]],-{Cos[\[Pi]/2-AmbidextrousAngle\[Beta]],Sin[\[Pi]/2-AmbidextrousAngle\[Beta]]}},
  {AmbiReflection[AmbiBNumerical[\[Pi]/2-AmbidextrousAngle\[Beta]]],-{Cos[\[Pi]/2-AmbidextrousAngle\[Beta]],-Sin[\[Pi]/2-AmbidextrousAngle\[Beta]]}},
  {AmbiBNumerical[\[Pi]/2],{0,-1}},
  {AmbiReflection[AmbiBNumerical[\[Pi]/2]],{0,1}},
  {AmbiCNumerical[AmbidextrousAngle\[Beta]],{-Sin[AmbidextrousAngle\[Beta]],Cos[AmbidextrousAngle\[Beta]]}},
  {AmbiReflection[AmbiCNumerical[AmbidextrousAngle\[Beta]]],{-Sin[AmbidextrousAngle\[Beta]],-Cos[AmbidextrousAngle\[Beta]]}},
  {AmbiANumerical[\[Pi]/2-AmbidextrousAngle\[Beta]],{Cos[\[Pi]/2-AmbidextrousAngle\[Beta]],Sin[\[Pi]/2-AmbidextrousAngle\[Beta]]}},
  {AmbiReflection[AmbiANumerical[\[Pi]/2-AmbidextrousAngle\[Beta]]],{Cos[\[Pi]/2-AmbidextrousAngle\[Beta]],-Sin[\[Pi]/2-AmbidextrousAngle\[Beta]]}},
  {{1,1/2},{1,0}},
  {{AmbiCNumerical[\[Pi]/2][[1]],1/2},{-1,0}}
};

AmbidextrousSofaNormalTickMarks={Black,Map[Line[{#[[1]]-0.025(#[[2]]/Norm[#[[2]]]),#[[1]]+0(#[[2]]/Norm[#[[2]]])}]&,AmbidextrousSofaNormalTickMarkData]};

(* Code to draw figures for the paper *)

SofaPaperFigureSquareSemicircle = Graphics[{
  SofaHallway[3],
  {Dashed,Arrow[Table[0.85{Cos[t],Sin[t]},{t,-\[Pi]/10-\[Pi]/20,-\[Pi]/2+\[Pi]/20,-0.01}]]},
  Rotate[SemicircleSofa,-\[Pi]/10,{0,0}],Translate[SquareSofa,{-2.5,0}]}
];

SofaPaperFigureGerverSofaWithTicks = Graphics[{
  GerverSofa, GerverSofaNormalTickMarks
}];

SofaPaperFigureAmbidextrousSofaWithTicks = Graphics[{
  AmbidextrousSofa, AmbidextrousSofaNormalTickMarks
}];

SofaPaperFigureOneSidedAmbidextrousSofaWithReflection = Graphics[OneSidedAmbidextrousSofaWithReflection];

AmbidextrousSofaCurveSegment8Modified=Most[Table[AmbiANumerical[t],{t,1.4,0.5,-(1.4-0.5)/Floor[SofaDefaultNumSubdivisionPoints/3]}]];
AmbidextrousSofaCurveSegment4Modified=Table[AmbiCNumerical[t],{t,1.4-0.5,0,-(1.4-0.5)/Floor[SofaDefaultNumSubdivisionPoints/3]}];SofaPaperContactPathsFigureAngle=0.65;
SofaPaperContactPathsFigureRightDashedcurve={{0.9354166666666666`,0.6479166666666667`},{1.0145833333333332`,0.4104166666666669`},{1.0229166666666665`,0.16041666666666687`},{0.9937500000000001`,0.05208333333333348`},{0.8520833333333331`,-0.002083333333333215`},{0.5770833333333332`,-0.010416666666666519`},{0.423,0}};
SofaPaperContactPathsFigureLeftDashedcurve={{-0.7729166666666667`,0.002083333333333215`},{-1.1062500000000002`,0.002083333333333215`},{-1.1812500000000001`,0.04791666666666661`},{-1.2270833333333333`,0.2729166666666665`},{-1.2437500000000001`,0.6229166666666666`},{-1.2104166666666667`,0.7312499999999997`}};
SofaPaperContactPathsFigureTopDashedcurve={{-0.7395833333333334`,1.0020833333333332`},{0.4770833333333332`,0.9937499999999999`}};
SofaPaperContactPathsFigureRightDashedcurveContactPathColorA=RGBColor[0.7,0,0];
SofaPaperContactPathsFigureRightDashedcurveContactPathColorB=RGBColor[0,0.5,0];
SofaPaperContactPathsFigureRightDashedcurveContactPathColorC=Blue;
SofaPaperContactPathsFigureRightDashedcurveContactPathColorD=Purple;
SofaPaperContactPathsFigureRightDashedcurveContactPathColorx=RGBColor[0.9,0.45,0];

SofaPaperContactPathsFigure=
Graphics[{
Translate[Rotate[SofaHallway[2],SofaPaperContactPathsFigureAngle,{0,0}],
AmbixNumerical[SofaPaperContactPathsFigureAngle]],
{SofaDefaultFillingColor,FilledCurve[
BSplineCurve[
Join[
AmbidextrousSofaCurveSegment10,AmbidextrousSofaCurveSegment1,AmbidextrousSofaCurveSegment2,SofaPaperContactPathsFigureLeftDashedcurve,AmbidextrousSofaCurveSegment4Modified,
SofaPaperContactPathsFigureTopDashedcurve,AmbidextrousSofaCurveSegment8Modified,SofaPaperContactPathsFigureRightDashedcurve
]
]]},
{
AbsoluteThickness[2],
{SofaPaperContactPathsFigureRightDashedcurveContactPathColorB,Line[Join[AmbidextrousSofaCurveSegment10]]},
{SofaPaperContactPathsFigureRightDashedcurveContactPathColorx,Line[Join[AmbidextrousSofaCurveSegment1]]},
{SofaPaperContactPathsFigureRightDashedcurveContactPathColorD,Line[Join[AmbidextrousSofaCurveSegment2]]},
{SofaPaperContactPathsFigureRightDashedcurveContactPathColorA,Line[AmbidextrousSofaCurveSegment8Modified]},
{SofaPaperContactPathsFigureRightDashedcurveContactPathColorC,Line[AmbidextrousSofaCurveSegment4Modified]}
},
{Dashing[{0.003,0.01}],AbsoluteThickness[1.5],Line[SofaPaperContactPathsFigureTopDashedcurve],BSplineCurve[SofaPaperContactPathsFigureLeftDashedcurve],BSplineCurve[SofaPaperContactPathsFigureRightDashedcurve]},
{
AbsolutePointSize[6],
Point[AmbixNumerical[SofaPaperContactPathsFigureAngle]],
Point[AmbiANumerical[SofaPaperContactPathsFigureAngle]],
Point[AmbiBNumerical[SofaPaperContactPathsFigureAngle]],
Point[AmbiCNumerical[SofaPaperContactPathsFigureAngle]],
Point[AmbiDNumerical[SofaPaperContactPathsFigureAngle]]
},
Style[Text["A",{0.94,0.77}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorA,Bold}],
Style[Text["B",{-0.02,0.09}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorB,Bold}],
Style[Text["x",{-0.09,0.44}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorx,Bold}],
Style[Text["D",{-0.41,0.04}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorD,Bold}],
Style[Text["C",{-1.19,0.92}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorC,Bold}],
Style[Text["(t)",{1.005,0.77}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorA,Italic}],
Style[Text["(t)",{0.045,0.09}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorB,Italic}],
Style[Text["(t)",{-0.03,0.44}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorx,Italic}],
Style[Text["(t)",{-0.345,0.04}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorD,Italic}],
Style[Text["(t)",{-1.125,0.92}],{18,SofaPaperContactPathsFigureRightDashedcurveContactPathColorC,Italic}],
{Black, Line[{{0.06561575948419139`,0.22152003469603787`},{0.041657189264183714`,0.21437952259864868`}}],
Line[{{-0.3997153945203201`,0.22152002820182118`},{-0.37575682430031242051509084749700119417`18.79934718963173,0.2143795161044319779301884245624498240300202134184892311637`18.67899172106783}}]}
},PlotRange->{{-1.4,1.1},{-0.1,1.2}},ImageSize->600];

rotationpathspecialx[t_]:={0.613763(Cos[2t]-1),0.75Sin[2t]};
rotationpathspecialA[t_]:=Collect[Simplify[rotationpathspecialx[t]+\[Mu][t]+(rotationpathspecialx'[t] . \[Mu][t])\[Nu][t]],{Cos[t],Sin[t]}];
rotationpathspecialB[t_]:=Collect[Simplify[rotationpathspecialx[t]+(rotationpathspecialx'[t] . \[Mu][t])\[Nu][t]],{Cos[t],Sin[t]}];
rotationpathspecialC[t_]:=Collect[Simplify[rotationpathspecialx[t]+\[Nu][t]-(rotationpathspecialx'[t] . \[Nu][t])\[Mu][t]],{Cos[t],Sin[t]}];
rotationpathspecialD[t_]:=Collect[Simplify[rotationpathspecialx[t]-(rotationpathspecialx'[t] . \[Nu][t])\[Mu][t]],{Cos[t],Sin[t]}];
rotationpathfigurepointsx=Table[rotationpathspecialx[t],{t,0.103,\[Pi]/2-0.103,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}];
rotationpathfigurepointsxdashed1=Table[rotationpathspecialx[t],{t,0,0.103,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}];
rotationpathfigurepointsxdashed2=Table[rotationpathspecialx[t],{t,\[Pi]/2-0.103,\[Pi]/2,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}];
rotationpathfigurepointsD=Reverse[Table[rotationpathspecialD[t],{t,0,\[Pi]/2-0.736,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}]];
rotationpathfigurepointsC=Reverse[Table[rotationpathspecialC[t],{t,0,\[Pi]/2,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}]];
rotationpathfigurepointsA=Reverse[Table[rotationpathspecialA[t],{t,0,\[Pi]/2,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}]];
rotationpathfigurepointsB=Reverse[Table[rotationpathspecialB[t],{t,0.736,\[Pi]/2,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}]];
rotationpathfiguredashedpath=Table[{rotationpathspecialx[\[Pi]/4][[1]],0}+0.86{rotationpathspecialx[t][[1]]-rotationpathspecialx[\[Pi]/4][[1]],rotationpathspecialx[t][[2]]},{t,0.04,\[Pi]/2-0.04,\[Pi]/2/SofaDefaultNumSubdivisionPoints/5}];
rotationpathfigurehighlightedhallwaytime=6*\[Pi]/2/20;
rotationpathfigurerotatedhallwayhighlighted={SofaHallwayDefaultFillingColor,EdgeForm[Black],Table[
Translate[Rotate[Polygon[{
{0,0},
{0,-3},
{1,-3},
{1,1},
{-3,1},
{-3,0}
}],t,{0,0}],rotationpathspecialx[t]]
,{t,{rotationpathfigurehighlightedhallwaytime}}]
};
rotationpathfigurerotatedhallways2={RGBColor[0,0,0,0],EdgeForm[RGBColor[0.4,0.4,0.4,0.6]],Table[
Translate[Rotate[Polygon[{
{0,0},
{0,-3},
{1,-3},
{1,1},
{-3,1},
{-3,0}
}],t,{0,0}],rotationpathspecialx[t]]
,{t,0,\[Pi]/2,\[Pi]/2/20}]
};

SofaPaperRotationPathFigure=Graphics[{
rotationpathfigurerotatedhallwayhighlighted,
rotationpathfigurerotatedhallways2,
{EdgeForm[{Black,AbsoluteThickness[1.5]}],SofaDefaultFillingColor,AbsoluteThickness[2],
Polygon[Join[rotationpathfigurepointsx,rotationpathfigurepointsD,rotationpathfigurepointsC,rotationpathfigurepointsA,rotationpathfigurepointsB]],
{Black,Dashing[Tiny],Line[rotationpathfigurepointsxdashed1],Line[rotationpathfigurepointsxdashed2]}
},
{RGBColor[0,0,0.7],Dashed,Arrowheads[0.02],Arrow[rotationpathfiguredashedpath]},
{Black,AbsolutePointSize[5],Point[{0,0}],Point[rotationpathspecialx[rotationpathfigurehighlightedhallwaytime]]},
{
Style[Text["(0,0)",{-0.12,-0.08}],14],
Style[Text["x",{-0.21,0.68}],14,Bold],
Style[Text["(t)",{-0.13,0.68}],14]
}
},PlotRange->{{rotationpathspecialC[\[Pi]/2][[1]]-0.3,1.3},{-0.3,1.3}},ImageSize->600];

SofaPaperFigureHammersleySofa=Graphics[{
HammersleySofa,
{GrayLevel[0.7],Dashed,Line[{{0,1},{0,0},{-4/\[Pi],0},{-4/\[Pi],1}}]}
}];

(* Code for interactive visualizations *)

SofaVisualizationGeneralizedHammersleySofasAreas:=Manipulate[
Column[{
 Row[{
 Show[Plot[HammersleyGeneralizedSofaArea[t],{t,0,1},ImageSize->240,AxesLabel->{"r","Sofa area"},PlotStyle->{Black,Thickness[0.005]},PlotRange->{1.5,2.3}],Graphics[{AbsolutePointSize[6],Point[{r,HammersleyGeneralizedSofaArea[r]}]}]],
 "   ",
 Graphics[HammersleyGeneralizedSofa[r],ImageSize->{Automatic,160}]
}],"","Inner radius: "<>ToString[r],"Area:   "<>ToString[HammersleyGeneralizedSofaArea[r]]
}],{r,0.0,1.0},FrameLabel->{"","",Style["Generalized Hammersley sofas: the area as a function of the inner radius",14,Bold]}];

SofaVisualizationGeneralizedHammersleySofasInHallway:=Manipulate[Show[
SofaMovieWithHallway[Max[4,2.5+2r],1.5,HammersleyGeneralizedSofa[r],HammersleyGeneralizedSofaRotationPath[r],t],ImageSize->400
],{r,0.00000000001,1.0},{t,0,3,ImageSize->400},FrameLabel->{"","",Style["Generalized Hammersley sofas moving around a corner",14,Bold]}]; 
(**** A small bug here with r=0 ****)

SofaMovieWithHallwayMultiPOV[armlength_,xinitial_,sofagraphics_,rotationpath_,time_,pov_,plotrangepov1_,plotrangepov2_]:=Module[{sofatrans,hallwaytrans},
sofatrans=Function[graphx,
If[time<=1,Translate[graphx,{-xinitial*(1-time),0}],
    If[time<=2,Rotate[Translate[graphx,-rotationpath[\[Pi]/2 (time-1)]],-(\[Pi]/2)(time-1),{0,0}],
      Translate[Rotate[Translate[graphx,-rotationpath[\[Pi]/2]],-(\[Pi]/2),{0,0}],
          {0,-xinitial*(time-2)}]]]];
hallwaytrans=Function[graphx,
If[time<=1,Translate[graphx,-{-xinitial*(1-time),0}],
    If[time<=2,Translate[Rotate[graphx,\[Pi]/2 (time-1),{0,0}],rotationpath[\[Pi]/2 (time-1)]],
      Translate[Rotate[Translate[graphx,-{0,-xinitial*(time-2)}],\[Pi]/2,{0,0}],
          rotationpath[\[Pi]/2]]]]];
If[pov!="Sofa",
Graphics[{SofaHallway[armlength],sofatrans[sofagraphics]},PlotRange->plotrangepov1],
Graphics[{hallwaytrans[SofaHallway[armlength]],sofagraphics},PlotRange->plotrangepov2]]
];

SofaVisualizationGerverSofaInHallway:=Manipulate[
If[pov=="Hallway",
Show[
SofaMovieWithHallwayMultiPOV[4,1.7,
{GerverSofa,If[showrotationpath,GerverSofaRotationPathDashedSegments,{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,GerverSofaContactPoints[\[Pi]/2 (t-1)]]}},{}],
If[showtickmarks,GerverSofaNormalTickMarks,{}]},
GerverSofaRotationPath,t,"Hallway",{{-4,1},{-4,1}},{{-0.5+GerverCNumerical[\[Pi]/2][[1]],1.5},{-0.5,1.5}}],ImageSize->400
],
If[pov=="Sofa",
Show[
SofaMovieWithHallwayMultiPOV[4,1.7,
{GerverSofa,If[showrotationpath,GerverSofaRotationPathDashedSegments,{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,GerverSofaContactPoints[\[Pi]/2 (t-1)]]}},{}],
If[showtickmarks,GerverSofaNormalTickMarks,{}]},
GerverSofaRotationPath,t,"Sofa",{{-4,1},{-4,1}},{{-0.5+GerverCNumerical[\[Pi]/2][[1]],1.5},{-0.5,1.5}}],ImageSize->400
],
Row[{
Show[
SofaMovieWithHallwayMultiPOV[4,1.7,
{GerverSofa,If[showrotationpath,GerverSofaRotationPathDashedSegments,{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,GerverSofaContactPoints[\[Pi]/2 (t-1)]]}},{}],
If[showtickmarks,GerverSofaNormalTickMarks,{}]},
GerverSofaRotationPath,t,"Hallway",{{-4,1},{-4,1}},{{-0.5+GerverCNumerical[\[Pi]/2][[1]],1.5},{-0.5,1.5}}],ImageSize->400
],"     ",
Show[
SofaMovieWithHallwayMultiPOV[4,1.7,
{GerverSofa,If[showrotationpath,GerverSofaRotationPathDashedSegments,{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,GerverSofaContactPoints[\[Pi]/2 (t-1)]]}},{}],
If[showtickmarks,GerverSofaNormalTickMarks,{}]},
GerverSofaRotationPath,t,"Sofa",{{-4,1},{-4,1}},{{-0.5+GerverCNumerical[\[Pi]/2][[1]],1.5},{-0.5,1.5}}],ImageSize->400
]
}]
]],
{t,0,3,ImageSize->300},{{showcontactpoints,False,"Show contact points:"},Checkbox},{{showtickmarks,False,"Show tick marks:"},Checkbox},
{{showrotationpath,False,"Show rotation path:"},Checkbox},
{{pov,"Hallway","Point of view:"},{"Hallway","Sofa","Both"}},
  FrameLabel->{"","",Style["Gerver's sofa moving around a corner",14,Bold]}];


SofaMovieWithHallwayTwoCornersMultiPOV[armlength_,leftendpoint_,sofagraphics_,rotationpath_,time_,pov_,plotrange1_,plotrange2_]:=Module[{basebpoint,xinitial,sofatrans,hallwaytrans},
xinitial=armlength+leftendpoint;
sofatrans=Function[graphx,
If[time<=1,Translate[graphx,{-xinitial*(1-time),0}],
    If[time<=2,Rotate[Translate[graphx,-rotationpath[\[Pi]/2 (time-1)]],-(\[Pi]/2)(time-1),{0,0}],
      If[time<=3,Translate[Rotate[Translate[graphx,-rotationpath[\[Pi]/2]],-(\[Pi]/2),{0,0}],
          {0,-xinitial*(time-2)}],
        If[time<=4,
            basepoint=rotationpath[\[Pi]/2 (4-time)];
            basepoint[[1]]=rotationpath[\[Pi]/2][[1]]-basepoint[[1]]; basepoint[[2]]=1-basepoint[[2]];
            Translate[Rotate[Translate[graphx,-basepoint],-(\[Pi]/2)(4-time),{0,0}],{1,-armlength+1}],
          If[time<=5,Translate[graphx,{-rotationpath[\[Pi]/2][[1]]+1+xinitial*(time-4),-armlength}],{}]
         ]
       ]
     ]
   ]
];
hallwaytrans=Function[graphx,
If[time<=1,Translate[graphx,-{-xinitial*(1-time),0}],
    If[time<=2,Translate[Rotate[graphx,\[Pi]/2 (time-1),{0,0}],rotationpath[\[Pi]/2 (time-1)]],
      If[time<=3,Translate[Rotate[Translate[graphx, -{0,-xinitial*(time-2)}],\[Pi]/2,{0,0}],
         rotationpath[\[Pi]/2]],
        If[time<=4,
            basepoint=rotationpath[\[Pi]/2 (4-time)];
            basepoint[[1]]=rotationpath[\[Pi]/2][[1]]-basepoint[[1]]; basepoint[[2]]=1-basepoint[[2]];
            Translate[Rotate[Translate[graphx,-{1,-armlength+1}],\[Pi]/2 (4-time),{0,0}],basepoint],
          If[time<=5,Translate[graphx,-{-rotationpath[\[Pi]/2][[1]]+1+xinitial*(time-4),-armlength}],{}]
         ]
       ]
     ]
   ]
];
If[pov!= "Sofa",
Graphics[{SofaHallwayTwoCorners[armlength],sofatrans[sofagraphics]},PlotRange->plotrange1],
Graphics[{hallwaytrans[SofaHallwayTwoCorners[armlength]],sofagraphics},PlotRange->plotrange2]
]];

SofaVisualizationAmbidextrousSofaInHallway:=Manipulate[
If[pov=="Hallway",
Show[SofaMovieWithHallwayTwoCornersMultiPOV[4,-1.334099633,
{AmbidextrousSofa,If[showrotationpath,{AmbidextrousSofaRotationPathDashedSegments,Rotate[AmbidextrousSofaRotationPathDashedSegments,\[Pi],{AmbixNumerical[\[Pi]/4][[1]],1/2}]},{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,AmbidextrousSofaContactPoints[\[Pi]/2 (t-1)]]}},
If[showcontactpoints&&3<=t<=4,{{AbsolutePointSize[5],Map[Point[AmbiReflection[#]]&,AmbidextrousSofaContactPoints[\[Pi]/2 (t-3)]]}},
{}]],
If[showtickmarks,AmbidextrousSofaNormalTickMarks,{}]},
AmbidextrousSofaRotationPath,t,pov,{{-4,5},{-4,1}},{{-0.5+AmbiCNumerical[\[Pi]/2][[1]],1.5},{-0.25,1.25}}],ImageSize->600],
If[pov=="Sofa",Show[
SofaMovieWithHallwayTwoCornersMultiPOV[4,-1.334099633,
{AmbidextrousSofa,If[showrotationpath,{AmbidextrousSofaRotationPathDashedSegments,Rotate[AmbidextrousSofaRotationPathDashedSegments,\[Pi],{AmbixNumerical[\[Pi]/4][[1]],1/2}]},{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,AmbidextrousSofaContactPoints[\[Pi]/2 (t-1)]]}},
If[showcontactpoints&&3<=t<=4,{{AbsolutePointSize[5],Map[Point[AmbiReflection[#]]&,AmbidextrousSofaContactPoints[\[Pi]/2 (t-3)]]}},
{}]],
If[showtickmarks,AmbidextrousSofaNormalTickMarks,{}]},
AmbidextrousSofaRotationPath,t,pov,{{-4,5},{-4,1}},{{-0.5+AmbiCNumerical[\[Pi]/2][[1]],1.5},{-0.25,1.25}}],ImageSize->600
],Row[{
Show[SofaMovieWithHallwayTwoCornersMultiPOV[4,-1.334099633,
{AmbidextrousSofa,If[showrotationpath,{AmbidextrousSofaRotationPathDashedSegments,Rotate[AmbidextrousSofaRotationPathDashedSegments,\[Pi],{AmbixNumerical[\[Pi]/4][[1]],1/2}]},{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,AmbidextrousSofaContactPoints[\[Pi]/2 (t-1)]]}},
If[showcontactpoints&&3<=t<=4,{{AbsolutePointSize[5],Map[Point[AmbiReflection[#]]&,AmbidextrousSofaContactPoints[\[Pi]/2 (t-3)]]}},
{}]],
If[showtickmarks,AmbidextrousSofaNormalTickMarks,{}]},
AmbidextrousSofaRotationPath,t,"Hallway",{{-4,5},{-4,1}},{{-0.5+AmbiCNumerical[\[Pi]/2][[1]],1.5},{-0.25,1.25}}],ImageSize->450],"    ",
Show[SofaMovieWithHallwayTwoCornersMultiPOV[4,-1.334099633,
{AmbidextrousSofa,If[showrotationpath,{AmbidextrousSofaRotationPathDashedSegments,Rotate[AmbidextrousSofaRotationPathDashedSegments,\[Pi],{AmbixNumerical[\[Pi]/4][[1]],1/2}]},{}],
If[showcontactpoints&&1<=t<=2,{{AbsolutePointSize[5],Map[Point,AmbidextrousSofaContactPoints[\[Pi]/2 (t-1)]]}},
If[showcontactpoints&&3<=t<=4,{{AbsolutePointSize[5],Map[Point[AmbiReflection[#]]&,AmbidextrousSofaContactPoints[\[Pi]/2 (t-3)]]}},
{}]],
If[showtickmarks,AmbidextrousSofaNormalTickMarks,{}]},
AmbidextrousSofaRotationPath,t,"Sofa",{{-4,5},{-4,1}},{{-0.5+AmbiCNumerical[\[Pi]/2][[1]],1.5},{-0.25,1.25}}],ImageSize->450]
}]]]
,{t,0,5,ImageSize->500},{{showcontactpoints,False,"Show contact points:"},Checkbox},{{showtickmarks,False,"Show tick marks:"},Checkbox},
{{showrotationpath,False,"Show rotation paths:"},Checkbox},
{{pov,"Hallway","Point of view:"},{"Hallway","Sofa","Both"}},
  FrameLabel->{"","",Style["Ambidextrous sofa moving around two corners",14,Bold]}];

SofaVisualizationSquareSofaInHallway:=Module[{r},
r=0.0001;
Manipulate[Graphics[{
SofaHallway[3],Translate[SquareSofa/.{SofaDefaultFillingColor->SquareSofaDefaultFillingColor},Piecewise[{{2.5{t-1,0},t<=1},{2.5{0,1-t},t<=2}}]]
},ImageSize->400],{t,0,2,ImageSize->400},FrameLabel->{"","",Style["Square sofa moving around a corner",14,Bold]}]
];

SofaVisualizationSemicircularSofaInHallway:=
Manipulate[Show[
SofaMovieWithHallway[4,1.5,HammersleyGeneralizedSofa[0.0001],HammersleyGeneralizedSofaRotationPath[0.0001],t],ImageSize->400
],{t,0,3,ImageSize->400},FrameLabel->{"","",Style["Semicircular sofa moving around a corner",14,Bold]}];

SofaVisualizationHammersleySofaInHallway:=
Manipulate[Show[
SofaMovieWithHallway[4,1.5,HammersleyGeneralizedSofa[2/\[Pi]],HammersleyGeneralizedSofaRotationPath[2/\[Pi]],t],ImageSize->400
],{t,0,3,ImageSize->400},FrameLabel->{"","",Style["Hammersley sofa moving around a corner",14,Bold]}];

SofaVisualizationsCombined=Manipulate[Piecewise[{{SofaVisualizationSquareSofaInHallway,vis=="Square"},
{SofaVisualizationSemicircularSofaInHallway,vis=="Semicircle"},
{SofaVisualizationHammersleySofaInHallway,vis=="Hammersley"},
{SofaVisualizationGeneralizedHammersleySofasInHallway,vis=="Generalized Hammersley"},
{SofaVisualizationGerverSofaInHallway,vis=="Gerver"},
{SofaVisualizationAmbidextrousSofaInHallway,vis=="Ambidextrous"}}],
{{vis,"Square","Choose sofa visualization:"},
{"Square","Semicircle","Hammersley","Generalized Hammersley","Gerver","Ambidextrous"}}];