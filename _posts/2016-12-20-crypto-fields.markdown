---
layout: post
title:  "How to construct finite fields for usage in cryptosystems"
date:   2016-12-20 10:00:00 +0200
categories: web
math: true
---
## Introduction
The goal of this article is to provide a walkthrough through relevant topics in order to
demonstrate how finite fields can be constructed for usage in cryptosystems.
The application of the methods will be demonstrated on three selected cryptosystems,
well actually two, one of them is a key exchange protocol.

In order to show how finite fields can be constructed and used in cryptosystems some
fundamental topics will be described which are enriched with links for you to find more
information. In the section fundamentals, an introduction is given to abstract algebra
by describing what a group, ring, and field is. Then the discrete logarithm problem will
be defined. This is a problem which assumed that it is hard to solve. Some of the
existing protocols and cryptosystems build on the assumption that this problem is hard to
solve. Afterward, polynomials and a special group of polynomials, namely the irreducible
polynomials will be discussed. The irreducible polynomials are a key element in order to
construct finite fields with $$q = p^n$$ elements where $$p$$ is prime and $$n \in \mathbb{N}$$.
Then, it is shown how to systematically construct finite fields $$\mathbb{F}_{p^n}$$.
Finally, it is demonstrated how to use the constructed finite fields in the case
of the Diffie-Hellman key exchange, Massey-Omura and ElGamal.

Where possible extensive proofs and theory has been saved in order to focus more on the
mechanics of the theory itself. For this, you often can find Haskell code after a section
in order to try the learned topics. There is no reason why I took Haskell.
I recommend to try out the methods described in each step which helps
a lot for understanding. Feel free to give the challenge exercises a try
which is added at the end of some sections.

### Fundamentals
There are two operations which can be applied on the integers, for instance.
The operations are addition and multiplication. It is possible to make this abstract
for any sets.

An operation on a set $$S$$ is a function $$f: S \times S \rightarrow S$$.
So, the function maps two elements of a set $$S$$ to another element $$f(a,b)$$
of the set $$S$$.
Operations are usually noted by $$+, \times, *$$ and so on, but usually not with letters.
Often the operation of two elements is noted using the infix notation as $$a+b$$
instead of, for instance, the prefix notation $$+(a,b)$$.

In this article one of the core mathematical or algebraic structures used is the
structure of a group. A group is a set $$G$$ with an operation $$*$$, such that the
following three axioms are true:

(i) $$*$$ is _associative_, that is, for all $$a,b,c \in G$$ it is

$$ a * (b * c) = (a * b) * c $$

(ii) there exists a _neutral element_ $$e$$, such that for all $$a \in G$$ it is

$$a*e=e*a = a.$$

(iii) For all $$a \in G$$ there exists an _inverse element_ $$a^{-1} \in G$$, such that

$$a*a^{-1} = a^{-1}*a=e.$$

And if the operation is also commutative, that is $$ a*b = b*a $$ for all $$a,b \in G$$
then the group is also called an abelian or commutative group.

Example:

Let $$G = ((\mathbb{Z}/3\mathbb{Z})^{\times}, *) = (\{ 1, 2 \}, *)$$.
The operation is defined as $$*: G \times G \rightarrow G$$ and $$*(a,b) \mapsto ab \text{ mod } 3$$ for all $$a,b \in G$$.
First of all, the operation $$*$$ is well defined, since the elements $$*(a,b)$$ for all
$$a,b \in G$$ are also contained in $$G = (\mathbb{Z}/3\mathbb{Z})^{\times}$$.

For all $$a,b \in G$$ it is $$ a * (b * c) = (a * b) * c$$:

$$
\begin{align}
a * (b * c) &= (a * (bc \text{ mod } 3)) &&\text{definition of }*\\
            &= (a \cdot (bc \text{ mod } 3)) \text{ mod } 3 &&\text{definition of }*\\
            &= (a \text{ mod } 3 \cdot bc \text{ mod } 3 ) \text{ mod } 3 &&\text{modulo multiplication}\\
            &= a(bc) \text{ mod } 3 &&\text{modulo multiplication}\\
            &= (ab)c \text{ mod } 3 &&\text{integer multiplication is associative}\\
            &= (ab \text{ mod } 3 \cdot c \text{ mod } 3) \text{ mod } 3 &&\text{modulo multiplication}\\
            &= ((ab \text{ mod } 3) \cdot c) \text{ mod } 3 &&\text{modulo multiplication}\\
            &= (ab \text{ mod } 3) * c &&\text{definition of }*\\
            &= (a * b) * c &&\text{definition of }*
\end{align}
$$

The operation $$*$$ is associative.
The calculations above are a slightly modified version of this [source][ModMultIsAssoc].

Since for all $$a \in G$$

$$
\begin{align}
1 * a &= 1 \cdot a \text{ mod } 3\\
      &= a \text { mod } 3\\
      &= a\\
      &= a \cdot 1 \text{ mod } 3\\
      &= a * 1
\end{align}
$$

there exists a neutral element $$e = 1 \in G$$.

For every element in $$G$$ there exists an inverse element in $$G$$:

$$
\begin{align}
1 * 1 = 1 \cdot 1 \text{ mod } 3 = 1 = e\\
2 * 2 = 2 \cdot 2 \text{ mod } 3 = 4 \text{ mod } 3 = 1 = e\\
\end{align}
$$

So, the three axioms are fulfilled and with this $$G$$ is a group.
Since $$a * b = ab \text{ mod } 3 = ba \text{ mod } 3 = b * a$$ for all $$a,b \in G$$
the group $$G$$ is an abelian group.

The study of the algebraic structure of a group is very useful and extensive. There are
a lot of highly useful and important concepts in the group theory, such as
[subgroups][SubGroupTest], [order of group elements][OrderOfGroupElements],
[Lagrange's theorem][LagrangeTheorem] with the related [cosets][Cosets],
[group homomorphisms][GroupHomomorphisms] which are basically mappings between groups
which preserve the group operation,
[the properties of group homomorphisms][GroupHomomorphismProps],
[normal subgroups and quotient groups][NormalAndQuotientGroups],
[class equation of a group][ClassEquation] and related concepts of
[centralizers and normalizers][CentralizerAndNormalizer]
and even more topics... All the mentioned topics are very interesting and useful.
However, in the following, I will focus more on the concept of [cyclic groups][CyclicGroups]
since cyclic groups are the essential part of the cryptosystems described later.

> A cyclic group is a group that can be generated by a single element X (the group generator).
> [[source][CyclicGroupDef]]

For example any [group with prime order is cyclic][PrimeGroupIsCyclic] - this is
actually a corollary of Lagrange's theorem.

$$
\begin{align}
((\mathbb{Z}/3\mathbb{Z})^{\times}, *) &= \{ 2^1=2, 2^2=4=1 \}\\
((\mathbb{Z}/5\mathbb{Z})^{\times}, *) &= \{ 3^1=3, 3^2=9=4, 3^3=27=2, 3^4=81=1 \}\\
((\mathbb{Z}/p\mathbb{Z})^{\times}, *) &= \{ a^i | i \in \mathbb{Z},  \} \text{ where }a \ne 1 \in \mathbb{Z}/p\mathbb{Z} \text{ and } p \text{ prime}\\
(\mathbb{Z}/3\mathbb{Z}, +) &= \{ 2, 2+2=4=1, 1+2=3=0 \}\\
(\mathbb{Z}/p\mathbb{Z}, +) &= \{ za | z \in \mathbb{Z} \} \text{ where } a \ne 0 \in \mathbb{Z}/p\mathbb{Z} \text{ and } p \text{ prime}
\end{align}
$$

Since the order of these groups is $$n < \infty$$ these groups are also called finite groups.
There are also examples of infinite groups, which have infinitely many elements
and are cyclic. It is easier to see when agreeing on the notation

$$
\begin{align}
za &= a + ... + a && a \text{ added } z \in \mathbb{Z} \text{ many times }\\
a^z &= a \cdot ... \cdot a && a \text{ multiplied } z \in \mathbb{Z} \text{ many times }
\end{align}
$$

Then, for instance, $$-1, 1 \in \mathbb{Z}$$ are the two generators of the group
$$(\mathbb{Z}, +)$$. If an element generates a group, such as $$1 \in \mathbb{Z}$$ in
the group of the integers, it is also denoted as

$$\langle1\rangle = \langle-1\rangle = \{ z \cdot 1 | z \in \mathbb{Z} \} = \mathbb{Z}$$

or when using the multiplicative notation. Let $$G$$ be a group and $$a \in G$$ a generator.
Then

$$\langle a\rangle = \{ a^i | i \in \mathbb{Z} \} = G.$$

Now, since later on, finite fields are going to be constructed, it needs to be defined
what a field actually is. The definition of the algebraic structure of a field is based
on the groups. Let $$(G,+)$$ be a group.
Then, if another operation $$*$$ is taken into the existing group $$R = (G,+,*)$$,
where the second operation fulfills the properties:

(i) the operation $$*$$ is associative and there exists a neutral element $$e_{*} \in G$$
such that $$e_{*} * a = a * e_{*} = a$$ for all $$a \in G$$.

(ii) the distributive rules are fulfilled:

$$
\begin{align}
a * (b + c) = a * b + a * c\\
(a + b) * c = a * c + b * c
\end{align}
$$

Then $$R = (G, +, *)$$ is called a _ring_. If also the condition $$a * b = b * a$$ holds
for all $$a, b \in R$$ then the ring is also called a _commutative ring_.

Note, that the ring does not fulfill necessarily the axiom, that there exists an
inverse element $$a^{-1}$$ for each element $$a \in R$$ such that
$$a * a^{-1} = a^{-1} * a = e$$.
Now, if a ring, such as $$R$$ also fulfills the condition about the inverse elements,
namely, if $$(R \backslash \{0\}, *)$$ is a group, then the ring can be called a field.
And if a field contains $$n < \infty$$ elements then the field is also called a
finite field. For instance, all sets $$(\mathbb{Z}/p\mathbb{Z}, +, *)$$
where $$p$$ is prime are fields.

In the next chapter, a problem is going to be defined.
Usually, the goal is to solve problems but in cryptography one is looking for really hard problems.
The motivation for finding hard problems, in this case, is to make it hard for someone
who does not and should not know some key information to solve a certain problem, namely
to read encrypted messages for instance.
In the following, a problem will be described. The good thing about the problem
is that can be defined over a cyclic group,
and with that also over every multiplicative subgroup of any finite field - especially the multiplicative group of a finite field itself. There are proofs about
the fact that every finite subgroup of a multiplicative group of a field is cyclic.
These proofs are unfortunately somewhat tricky. If you are interested I want to encourage
you to take a look at the proofs [here][MultCyclicFiniteFieldGroup1],
[here][MultCyclicFiniteFieldGroup2] and [here][MultCyclicFiniteFieldGroup3].
I would recommend though, to learn first about the details of
[Lagrange's theorem][LagrangeTheorem] and especially about the
[order of group elements][OrderOfGroupElements] together with the topic about all the
[properties of subgroups of finite cyclic groups][FiniteCyclicSubgroupProps] is very helpful in my opinion.

**Your turn:** Prove that it is $$((a \text{ mod } m) \cdot (b \text{ mod } m)) \text{ mod } m = ab \text{ mod } m\$$.

### Discrete Logarithm Problem
The goal of encrypting and decrypting a message is to make it hard for an unwanted
recipient to read the message. However, a method is required to make it easy for the
wanted recipient to easily decrypt the encrypted message. In its core, a function is
needed which is easy to compute but its inverse isn't easy to compute.

$$
\begin{align}
f: S &\rightarrow S\\
a &\mapsto b = f(a), a,b \in S
\end{align}
$$

It should be easy to compute $$f(a)=b$$, but $$f^{-1}(f(a))=a$$ shouldn't be.
This seems to be the case in the Discrete Logarithm Problem (DLP). The DLP can be
defined over a finite cyclic group. Previously, the cyclic groups were described.
The important property of a cyclic group is that it contains a generator element.
Multiplying the generator element by itself yields all elements in the cyclic group
until the neutral element is reached. However, the generated elements
are not used to be sorted. There is no obvious way to approximate the number of times
to multiply the generator by itself to yield a particular element.

Lets take the cyclic group $$((\mathbb{Z}/23\mathbb{Z})^{\times}, \cdot)$$
with generator $$19 \in (\mathbb{Z}/23\mathbb{Z})^{\times}$$.

$$\{ 19^1, 19^2, 19^3, ..., 19^{20}, 19^{21}, 19^{22} \} = \{19, 16, 5, ..., 13, 17, 1 \}$$.

Visualizing the successive way of generating the elements looks as follows:

![Generating the elements of a multiplicative group](/gif/group-generation.gif "Generating the elements of a multiplicative group")

In the illustration the bars at the top represent from left to right the indices $$1 \leq i \leq 22$$.
The bars at bottom represent for each selected index $$i$$ above the element $$19^i \in (\mathbb{Z}/23\mathbb{Z})^{\times}$$.

It is a known fact that the multiplicative group $$\mathbb{F}^{\times}$$ - and every subgroup of $$\mathbb{F}^{\times}$$ especially the $$\mathbb{F}^{\times}$$
itself too - of a finite field $$\mathbb{F}$$ is a cyclic group.
Thus, such group also has a generator element $$g$$ which can be used to denote all
other elements $$g^i \in \mathbb{F}^{\times}, i \in \mathbb{Z}$$ in the group.
So, the DLP can be defined over finite fields:

Let $$\mathbb{F}$$ be a finite field and let $$g \in \mathbb{F}$$ be a generator of
$$\mathbb{F}^{\times}$$. The generator for the multiplicative group of a finite field
is also referred to as the primitive element. Let $$b \in \mathbb{F}^{\times}$$.
Find $$i \in \mathbb{Z}$$ such that it is $$b = g^i$$, where $$i$$ is called the
discrete logarithm of $$b$$ to the base $$g$$.

As an example take again the finite field $$\mathbb{F}_{23} = (\mathbb{Z}/23\mathbb{Z}, +, \cdot)$$.
Then $$\mathbb{F}_{23}^{\times} = \mathbb{F}_{23} \backslash \{0\}$$ is the multiplicative group.
Let $$g = 5 \in \mathbb{F}_{23}^{\times}$$ be a generator. Find $$i \in \mathbb{Z}$$ such that it is $$g^i \equiv 6$$.
In order to find $$i$$, you may guess an integer or try to brute-force it.
There are in total 22 different elements in $$\mathbb{F}_{23}^{\times}$$.
Since it is $$a^{|\mathbb{F}_{23}^{\times}|} = a^{22} = 1$$ for all $$a \in \mathbb{F}_{23}^{\times}$$
we can exclude $$i=22$$ from the possibilities. Also, we can exclude $$i=1$$ since $$5^1 = 5 \ne 6$$.
So there are 20 possible values for $$i$$ remaining where $$g^i = 6$$ could be true.

$$
\begin{align}
5^2 &\equiv 2\\
5^3 &\equiv 10\\
5^4 &\equiv 4\\
...\\
5^{18} &\equiv 6
\end{align}
$$

OK, after 17 tries the needed value $$i=18 \in \mathbb{Z}$$ has been found.
Since this finite field is rather small it is relatively easy to solve the DLP.

**Try this:**

a) Let $$p=53$$ be a prime number. Then $$\mathbb{F}_p$$ is a finite field.
Let $$g = 2 \in \mathbb{F}_p^{\times}$$ be a generator of $$\mathbb{F}_p^{\times}$$.
Let $$33 = g^i$$. Find $$i$$.

b) Let $$p=17389$$ be a prime number. Then $$\mathbb{F}_{p}$$ is a finite field.
Let $$g = 490 \in \mathbb{F}_p^{\times}$$ be a generator of $$\mathbb{F}_p^{\times}$$.
Let $$28 = g^i$$. Find $$i$$.

## Polynomials

### Definition
In order to be able to explicitly construct $$\mathbb{F}_{p^n}$$ fields, we will need
so-called irreducible polynomials. So, first we need to understand what a polynomial is
and we need to be able to add, multiply two polynomials and modulo reduce a polynomial
by another polynomial.

> A polynomial is a mathematical expression involving a sum of powers in one or more
> variables multiplied by coefficients. [[source][Poly]]

Given a field $$\mathbb{F}_p = \mathbb{Z}/p\mathbb{Z}$$, where $$p$$ is prime, the
article focuses only on univariate polynomials, i.e. polynomials in one variable with
constant coefficients are given by

$$ \sum_{i=0}^{n} a_iT^i = a_0T^0 + a_1T^1 + ... + a_nT^n \in \mathbb{F}_p[T], $$

where $$ a_i \in \mathbb{F}_p $$.

### Binary operations

In order to be able to construct $$\mathbb{F}_{p^n}$$ finite fields, we will need to
compute [irreducible polynomials][IrrPoly]. For computing irreducible polynomials
we will need to be able to add and multiply polynomials.

Let $$ f, g \in \mathbb{F}_p[T] $$ be two polynomials.
In the following polynomials are notated as a sequence of elements.
Although these sequences are infinite, the infinite many zeros are not shown below.
Any polynomial $$f=a_0T^0 + ... + a_nT^n \in \mathbb{F}_p[T]$$
can be noted as an infinite sequence $$[a_0, ..., a_n, 0, ...]$$,
where $$a_i \in \mathbb{F}_p$$.
Let $$ f = [a_0, a_1, ...] $$ and $$ g = [b_0, b_1, ...] $$.

Then adding both polynomials yields

$$ f + g = [a_0, a_1, ...] + [b_0, b_1, ...] = [a_0 + b_0, a_1 + b_1, ...] \in \mathbb{F}_p[T] $$

For example let $$f = [5, 0, 3, 0, ...] \in \mathbb{F}_7[T]$$ and $$g = [2, 4, 1, 0, ...] \in \mathbb{F}_7[T]$$.
Then adding both polynomials gives:

$$f + g = [5, 0, 3, 0, ...] + [2, 4, 1, 0, ...] = [7, 4, 4, 0, ...] = [0, 4, 4]$$.

Alternatively the same can be written as:

$$
\begin{align}
f + g &= (3T^2 + 5) + (T^2 + 4T + 2)\\
      &= 3T^2 + T^2 + 4T + 5 + 2\\
      &= 4T^2 + 4T + 7\\
      &= 4T^2 + 4T\\
\end{align}
$$

Note that each coefficient needs to be modulo reduced by 7 in this case since the
polynomials are in $$\mathbb{F}_7[T]$$ and thus the coefficients are in
$$\mathbb{F}_7=\mathbb{Z}/7\mathbb{Z}$$.

```haskell
type Poly = [Int]

binop :: (Int -> Int -> Int) -> Poly -> Poly -> Poly
binop f [] []         = []
binop f [] y          = y
binop f x  []         = x
binop f (x:xs) (y:ys) = (f x y) : (binop f xs ys)

plus :: Poly -> Poly -> Poly
plus = binop (+)

minus :: Poly -> Poly -> Poly
minus = binop (-)
```

Multiplying the two polynomials is done by multiplying each term of one polynomial
with each term of the other polynomial. Given $$f=T^2+T+1 \in \mathbb{F}_2[T]$$ and
$$g=T+1 \in \mathbb{F}_2[T]$$, here is an example for $$f*g \in \mathbb{F}_2[T]$$:

$$
\begin{align}
(T^2 + T + 1) * (T + 1) &= ((T^3 + T^2) + (T^2 + T) + (T + 1)) \\
                        &= T^3 + T^2 + T^2 + T + T + 1 && \text{+ is associative} \\
                        &= T^3 + 2T^2 + 2T + 1 && \text{simplify} \\
                        &= T^3 + 1 && \text{mod 2 since coefficients are in }\mathbb{F}_2
\end{align}
$$

When we note the two polynomials as a sequence of coefficients there is a systematic
way to express the sequence of coefficients for the polynomial product.
First of all the two polynomials can be noted as $$f = [1, 1, 1]$$ and $$g = [1,1]$$.

Generally, let $$[a_0, a_1, ...]$$ and $$[b_0, b_1, ...]$$ be two polynomials.
Let $$[c_0, c_1, ...]$$ be the product of the two polynomials.
Then each coefficient $$c_k$$ can be computed by

$$ c_k = \sum_{i+j=k} a_ib_j\text{.} $$

The maximum value of the variable $$k$$ is the sum of the maximum value of $$i$$ and $$j$$.
This way the process of multiplying each term of the first polynomial with each term
of the second polynomial and eventually simplifying the results in order to yield the
final coefficients are expressed altogether.

To take our example above, let $$[a_0, a_1, a_2] = [1,1,1]$$ and $$[b_0, b_1] = [1,1]$$,
where $$a_i,b_j \in \mathbb{F}_2$$.
It is $$0 <= k <= 3$$, since $$i$$ can take at most $$2$$ and $$j$$ can
take at most $$1$$. For all $$i > 2$$ and for all $$j > 1$$ the coefficients are $$a_i = 0$$ and $$b_j = 0$$. So the first four coefficients of our example can be computed by

$$
\begin{align}
c_0 &= \sum_{i+j=0} = a_0b_0 = 1 \cdot 1 \equiv 1\\
c_1 &= \sum_{i+j=1} = a_0b_1 + a_1b_0 = 1 \cdot 1 + 1 \cdot 1 = 2 \equiv 0\\
c_2 &= \sum_{i+j=2} = a_1b_1 + a_2b_0 = 1 \cdot 1 + 1 \cdot 1 = 2 \equiv 0\\
c_3 &= \sum_{i+j=3} = a_2b_1 = 1 \cdot 1 \equiv 1\text{.}\\
\end{align}
$$

Thus, the product of the polynomials $$[1,1,1]$$ and $$[1,1]$$ is $$[1,0,0,1]$$
or in other words $$T^3 + 1$$.

```haskell
multiply :: Poly -> Poly -> Poly
multiply [] [] = []
multiply x  y  = multiply' 0 max_k
  where
    max_k = n + m
    n     = length x - 1
    m     = length y - 1

    multiply' k max_k
      | k <= max_k = (:) (sum [(x!!i)*(y!!j) | (i,j) <- filteredIndices k])
                         (multiply' (k+1) max_k)
      | otherwise  = []

    filteredIndices k = filter (\ (i,j) -> i+j == k) (indices)
    indices = [ (i, j) | i <- [0..n], j <- [0..m] ]
```

**Try this:**

a) Let $$f = 5T + 8 \in \mathbb{F}_{13}[T]$$ and
$$g = T^2 + 8T + 8 \in \mathbb{F}_{13}[T]$$. Calculate $$f+g$$.

b) Let $$f=T^2+1 \in \mathbb{F}_2[T]$$ and
$$g=T+1 \in \mathbb{F}_2[T]$$. Calculate $$f \cdot g$$.

c) Let $$f=2T^2+T+1 \in \mathbb{F}_3[T]$$ and
$$g=2T+1 \in \mathbb{F}_3[T]$$. Calculate $$f \cdot g$$.

### Irreducible polynomials

> A polynomial is said to be irreducible if it cannot be factored into
> nontrivial polynomials over the same field. [[source][IrrPoly]]

In other words a polynomial $$f \in \mathbb{F}[T]$$ is irreducible if its degree
is greater than zero and if $$f = gh$$ with $$g,h \in \mathbb{F}[T]$$ implicates that
$$g$$ or $$b$$ are constant values.

Let's look at the polynomials in $$\mathbb{F}_2[T]$$ of degree between 1 and 2.
Firstly, in order to examine the polynomials, first, we will need to list all possible
polynomials of degree 1 and all possible polynomials of degree 2.

If we look at the polynomials as an infinite sequence it is easy to notice that
for a polynomial $$f = [x_0, x_1, ..., x_d] \in \mathbb{F}_2[T]$$ with degree $$d$$
it must be $$x_d = 1 > 0 \in \mathbb{F}_2$$. Note that for polynomials over a field
with a characteristic $$m>2$$ there can be more than one possible value for $$x_d$$,
namely there are $$m-1$$ possible values for $$x_d$$ since the value zero will be excluded.
While it is $$x_d = 1 \in \mathbb{F}_2$$ the coefficients $$x_i \in \mathbb{F}_2$$
for all $$0 \ge i \ge d-1$$ can each take $$m$$ different values/states between 0 and $$m-1$$.

This way we can successively list the polynomials with degree $$1 \le d \le 2$$:

$$
\begin{align}
T       &= [0,1]\\
T+1     &= [1,1]\\
T^2     &= [0,0,1]\\
T^2+1   &= [1,0,1]\\
T^2+T   &= [0,1,1]\\
T^2+T+1 &= [1,1,1]\\
\end{align}
$$

Obviously, the polynomial $$T = [0,1]$$ cannot be factored into two non-constant
polynomials and thus it is an irreducible polynomial. Same applies to $$T+1$$, since
$$T \cdot T = T^2 \ne T+1$$. On the other hand, $$T^2$$ is not irreducible or to put it
differently, $$T^2$$ is reducible. For the other polynomials it might require to take a
good look at them, or we successively compute the product of all "lower" polynomials
and check whether we find any product of two polynomials with degree greater than 0
that equals the target polynomial. If there exist no such two polynomials the target
polynomial is irreducible. To complete the example above:

<center>
<table class="crosstable">
  <tr>
    <td>$$\cdot$$</td> <td>$$T$$</td> <td>$$T+1$$</td>
  </tr>
  <tr>
    <td>$$T$$</td> <td>$$T^2$$</td> <td>$$T^2+T$$</td>
  </tr>
  <tr>
    <td>$$T+1$$</td> <td>$$T^2+T$$</td> <td>$$T^2+1$$</td>
  </tr>
</table>
</center>

From this table, it can be clearly observed that $$T^2$$, $$T^2+1$$ and $$T^2+T$$ are reducible.
Thus, the remaining polynomials are the irreducible polynomials of degree 1 and 2, namely $$T$$, $$T+1$$ and $$T^2+T+1$$.

```haskell
-- given a characteristic m and degree d
-- compute all polynomials of degree d
genP :: Int -> Int -> [Poly]
genP m 0 = [ [i] | i <- [0..m-1]]
genP m d = genP' m (d+1)
  where
    genP' m d'
      | d' == 0   = []
      | d' == 1   = [ [i] | i <- [1..m-1] ]
      | otherwise = foldl (++) [] [ map ([i] ++) $ genP' m (d'-1) | i <- [0..m-1]]

-- given a characteristic m and degree d
-- compute all polynomials of degree lower than d
genLowerP :: Int -> Int -> [Poly]
genLowerP m 0 = []
genLowerP m d = genLowerP m (d-1) ++ genP m (d-1)

-- given a characteristic m and a degree d
-- compute all products of polynomials of degree d
-- the products are also called reducible polynomials
genProductsP :: Int -> Int -> [(Poly, Poly, Poly)]
genProductsP m d = foldl (++) [] [ products (factors i j) | (i,j) <- indices ]
  where
    indices     = [ (i, d-i) | i <- [1..d `div` 2] ]
    factors i j = [ (f, g) | f <- genP m i, g <- genP m j ]
    products ps = map (\ (f,g) -> (f, g, modReduce m $ multiply f g)) ps

-- given a characteristic m and a polynomial
-- modulo reduce each coefficient of the polynomial
-- and trim off trailing zeros
modReduce :: Int -> Poly -> Poly
modReduce m = trim . map (`mod` m)

trim :: Poly -> Poly
trim [] = [0]
trim x = trim' (reverse x)
  where trim' [] = [0]
        trim' (x:xs)
          | x == 0    = trim' xs
          | otherwise = reverse (x:xs)

{-
1. List all polynomials of degree d
2. Compute products of polynomials with degree lower than d.
   The result is a list of all reducible polynomials with degree lower or equal to d.
3. Filter all polynomials of degree d which are reducible.
   Result is the list of all irreducible polynomials of degree d.
-}
-- given a characteristic m and the target degree d
-- compute the irreducible polynomials of degree d
irreduciblesP :: Int -> Int -> [Poly]
irreduciblesP m d = filter (\ f -> (==0) . length $ filter (==f) reducibles) (genP m d)
  where
    reducibles = map (\ (_,_,x) -> x) (genProductsP m d)
```

Some more examples of irreducible polynomials:<br>
Irreducible polynomials of degree 3 in $$\mathbb{F}_2[T]$$<br>
$$\{ [1,0,1,1],[1,1,0,1] \}$$<br>
Output of `irreduciblesP 2 3`.

Irreducible polynomials of degree 4 in $$\mathbb{F}_2[T]$$<br>
$$\{ [1,0,0,1,1],[1,1,0,0,1],[1,1,1,1,1] \}$$<br>
Output of `irreduciblesP 2 4`.

This is a rather naïve approach for generating irreducible
polynomials which is slow. There are also [probabilistic][FastIrrPoly] or
[deterministic][FastIrrPoly2] approaches which allows finding irreducible polynomials
much more efficiently.

The generated irreducible polynomials are required in the following steps in order to
construct finite fields.

**Try this:**

a) Find an irreducible polynomial of degree $$1$$ in $$\mathbb{F}_3[T]$$.

b) Is the polynomial $$f = T^3 + T + 1 \in \mathbb{F}_2[T]$$ irreducible?

c) Is the polynomial $$f = 3T^2 + 3T + 4 \in \mathbb{F}_5[T]$$ irreducible?

## Construction of finite fields
Let $$\mathbb{F}_p= \mathbb{Z}/p\mathbb{Z}$$ be a finite field, and let
$$\text{char}(\mathbb{F})=p$$ be the characteristic of $$\mathbb{F}_p$$,
where $$p$$ is prime.
Let $$f \in \mathbb{F}_p[T]$$ be an irreducible polynomial of degree $$n$$.
Then $$\mathbb{F}_p[T]/(f)$$ is a finite field with $$p^n$$ elements,
where $$(f)$$ is the [ideal][Ideal] generated by $$f$$.
See [definitions, properties][FiniteField] and [examples][Explicit_construction_of_finite_fields].

> An ideal is a subset $$I$$ of elements in a ring $$R$$ that forms an additive group and has
> the property that, whenever $$x$$ belongs to $$R$$ and $$y$$ belongs to $$I$$,
> then $$xy$$ and $$yx$$ belong to $$I$$.[[source][Ideal]]

The elements of the finite field $$\mathbb{F}_p[T]/(f)$$ are cosets.
Every field is also a ring. In the terminology of the ring theory $$\mathbb{F}_p[T]/(f)$$ is called the
factor ring of $$\mathbb{F}_p[T]$$ modulo $$(f)$$ or quotient ring of $$\mathbb{F}_p[T]$$
modulo $$(f)$$. The quotient ring contains the cosets which are yielded by modulo reducing
each element in the original ring. Take, for instance, the ring
$$R = \mathbb{Z}$$. As an ideal, we could use

$$I = (2) = 2\mathbb{Z} = \{ ..., -8, -6, -4, -2, 0, 2, 4, 6, 8, ... \}$$

because, firstly $$(2\mathbb{Z}, +)$$ is a subgroup of $$(\mathbb{Z}, +)$$ and secondly
for all $$a \in 2\mathbb{Z}$$ and for all $$b \in \mathbb{Z}$$ the elements $$ab$$ and
$$ba$$ are contained in the set $$2\mathbb{Z}$$.

Now, the original set of elements
$$\mathbb{Z}$$ can be partitioned into cosets by $$z + I$$ modulo $$I$$. The cosets
are also called the equivalency classes and are denoted by $$[z] = \{ z + i | i \in I \}$$.
If two elements $$a, b \in \mathbb{Z}$$ are contained within the same coset, these
two elements are said to be congruent modulo $$I$$. This is also often written as
$$a \equiv b (\text{mod} I)$$.

$$
\begin{align}
a \equiv b (\text{mod} I) &\iff a = b + i \in I &&\text{for some } i \in I\\
                          &\iff a - b = i \in I\\
                          &\iff a - b \in I
\end{align}
$$

Since $$a = b + i \in I$$, it follows $$a \in [b]$$ for some $$i \in I$$.
Since it is also $$a \in [a]$$ and cosets are either the same or disjunct
it follows $$[a] = [b]$$. To take $$\mathbb{Z}/I$$ as an example
where $$I = (2) = 2\mathbb{Z}$$, the elements of this set are the cosets:

$$
\begin{align}
a + 2\mathbb{Z} = \{ ..., a + 2(-2), a + 2(-1), a + 2(0), a + 2(1), a + 2(2), ... \}
\end{align}
$$

for all $$a \in \mathbb{Z}$$. Since there are infinitely many elements in $$\mathbb{Z}$$
it seems there are infinitely many cosets in $$Z/I$$. However, when looking
at the cosets more sharply:

$$
\begin{align}
a + 2\mathbb{Z} = \{ ..., -6, -4, -2, 0, 2, 4, 6, ...  \} && \text{for } a = 0\\
a + 2\mathbb{Z} = \{ ..., -5, -3, -1, 1, 3, 5, 7, ...  \} && \text{for } a = 1\\
a + 2\mathbb{Z} = \{ ..., -4, -2,  0, 2, 4, 6, 8, ...  \} && \text{for } a = 2\\
a + 2\mathbb{Z} = \{ ..., -3, -1,  1, 3, 5, 7, 9, ...  \} && \text{for } a = 3\\
\end{align}
$$

In fact, it seems there are only two cosets contained in the quotient ring, namely:

$$
\begin{align}
[0] = 0 + 2\mathbb{Z} = 2 + 2\mathbb{Z} = 4 + 2\mathbb{Z} = ... = 2z + 0 + 2\mathbb{Z}\\
[1] = 1 + 2\mathbb{Z} = 3 + 2\mathbb{Z} = 5 + 2\mathbb{Z} = ... = 2z + 1 + 2\mathbb{Z}\\
\text{where } z \in \mathbb{Z}
\end{align}
$$

Together with two operations $$+$$ and $$\cdot$$ to be defined on the elements of the
set of cosets $$R/I$$, it can be shown that $$\mathbb{Z}/I$$ is a ring. Note, that
in the example above there may be only two cosets in the set but there are infinitely
many different names for those two cosets. For instance, it is $$[0] = [2] = [4] = ...$$
and $$[1] = [3] = [5] = ...$$

Similarly $$\mathbb{F}_p[T]/(f)$$ is a quotient ring. However, it is a
[known fact][ProofPIDCorollary] that in particular, $$\mathbb{F}_p[T]/(f)$$ is a finite
field if $$f$$ is an irreducible polynomial. In this case, instead of the cosets of the
integers in the example above, the quotient ring $$\mathbb{F}[T]/(f)$$ consists of the
cosets $$[a] = a + (f) = \{ a + bf | b \in \mathbb{F}[T] \}$$.
The operations $$[a] + [b]$$ and $$[a] [b]$$ are defined by $$[a + b]$$ and $$[ab]$$.
Two cosets $$[a], [b]$$ are equal if $$a-b \in (f)$$. In other words $$[a], [b]$$ are
equal if $$a-b$$ is divisible by $$f$$ such that both leave the same remainder.
Every coset $$[a]$$ modulo $$(f)$$ contains exactly one polynomial $$r$$ with
$$\text{degree}(r) < \text{degree}(f)$$, where the polynomial $$r$$ is actually the
remainder when dividing $$a$$ by $$f$$.
So, the elements in $$\mathbb{F}[T]/(f)$$ look as follows:

$$[r] = r + (f)$$

where $$r$$ are all polynomials in $$\mathbb{F}[T]$$ with $$\text{degree}(r) < \text{degree}(f)$$.

In the following example, the elements of $$\mathbb{F}_{2}[T]/(T^2+T+1)$$ is being calculated step-by-step.
Since every coset $$[a], a \in \mathbb{F}_2[T]$$ modulo $$(f)$$ contains exactly one
polynomial $$r$$ which is the remainder when dividing by $$f$$ and since
$$\text{degree}(r) < \text{degree}(f)$$ all possible remainders in case of
$$f = T^2 + T + 1 = [1,1,1]$$ are: $$ [0], [1], [0,1], [1,1] $$ or written differently
$$0, 1, T, T^2$$. The binary operation tables show how to map two cosets.

<table align="center">
  <thead>
    <th align="center" colspan="5">
    Additive operation
    </th>
  </thead>
  <tbody>
    <tr>
      <td><b>+</b></td>
      <td><b>{0}</b></td>
      <td><b>{1}</b></td>
      <td><b>{T}</b></td>
      <td><b>{T+1}</b></td>
    </tr>
    <tr>
      <td><b>{0}</b></td>
      <td>{0}</td>
      <td>{1}</td>
      <td>{T}</td>
      <td>{T+1}</td>
    </tr>
    <tr>
      <td><b>{1}</b></td>
      <td>{1}</td>
      <td>{0}</td>
      <td>{T+1}</td>
      <td>{T}</td>
    </tr>
    <tr>
      <td><b>{T}</b></td>
      <td>{T}</td>
      <td>{T+1}</td>
      <td>{0}</td>
      <td>{1}</td>
    </tr>
    <tr>
      <td><b>{T+1}</b></td>
      <td>{T+1}</td>
      <td>{T}</td>
      <td>{1}</td>
      <td>{0}</td>
    </tr>
  </tbody>
</table>
<table align="center">
  <thead>
    <th align="center" colspan="5">
      Multiplicative operation
    </th>
  </thead>
  <tbody>
    <tr>
      <td><b> * </b></td>
      <td><b>{0}</b></td>
      <td><b>{1}</b></td>
      <td><b>{T}</b></td>
      <td><b>{T+1}</b></td>
    </tr>
    <tr>
      <td><b>{0}</b></td>
      <td>{0}</td>
      <td>{0}</td>
      <td>{0}</td>
      <td>{0}</td>
    </tr>
    <tr>
      <td><b>{1}</b></td>
      <td>{0}</td>
      <td>{1}</td>
      <td>{T}</td>
      <td>{T+1}</td>
    </tr>
    <tr>
      <td><b>{T}</b></td>
      <td>{0}</td>
      <td>{T}</td>
      <td>{T+1}</td>
      <td>{1}</td>
    </tr>
    <tr>
      <td><b>{T+1}</b></td>
      <td>{0}</td>
      <td>{T+1}</td>
      <td>{1}</td>
      <td>{T}</td>
    </tr>
  </tbody>
</table>
<br>
For instance, for the operation $$+$$ each element needs to be _added_ to the other,
so all possible combinations of elements were applied to the operation $$+$$.
Remember, that the $$+$$ on cosets is defined as $$[a]+[b] = [a+b]$$ and similarly the $$\cdot$$
operation is $$[a][b]=[ab]$$.

$$
\begin{align}
...\\
[T]+[0]   &= [T+0]   =[T]          &=& \{T\}\\
[T]+[1]   &= [T+1]                 &=& \{T+1\}\\
[T]+[T]   &= [T+T]   = [2T]   =[0] &=& \{0\}\\
[T]+[T+1] &= [T+T+1] = [2T+1] =[1] &=& \{1\}\\
...\\
\end{align}
$$

and similarly for the operation $$\cdot$$ the calculation can be done as follows:

$$
\begin{align}
...\\
[T] [0]   &= [T \cdot 0] = [0] &=& \{0\}\\
[T] [1]   &= [T \cdot 1] = [T] &=& \{T\}\\
[T] [T]   &= [T \cdot T] = [T^2] = [T+1] &=& \{T+1\}\\
[T] [T+1] &= [T \cdot (T+1)] = [T^2+T]\\
          &= [T^2] + [T]= [T+1] + [T]\\
          &= [T+T+1] = [2T + 1] = [1] &=& \{1\}\\
...\\
\end{align}
$$

Note, that in the above calculation $$[T] [T] = [T^2] = [T+1]$$ the polynomial division
has been applied in order to divide $$T^2$$ by $$T^2+T+1$$ which yields the
remainder polynomial $$T+1$$ since it is

$$
\begin{align}
[T^2] &= [1] [T^2+T+1] + [T+1]\\
      &= [1 \cdot (T^2+T+1)] + [T+1]\\
      &= [T^2+T+T+1+1]\\
      &= [T^2+2T+2]\\
      &= [T^2+0T+0] = [T^2]
\end{align}
$$

In another example lets construct the finite field $$\mathbb{F}_3[T]/(T+2)$$.
The elements in this field are the cosets each containing exactly one polynomial
since the remainder is the same within each coset when dividing by $$f=T+2$$.
Recall, that these remainder polynomials $$r$$ have a $$\text{degree}(r) < \text{degree}(f)$$
where $$\text{degree}(f) = \text{degree}(T+2) = 1$$.
So, in this case since the characteristic of the field is $$3$$ we have $$3^1=3$$
different cosets in the field, namely:

$$ \mathbb{F}_3[T]/(T+2) = \{ [0], [1], [2] \} $$

Note that above the square brackets do not denote a sequence as done in the section
about polynomials but denote the coset itself generated by the polynomial noted inside
the square brackets. Finally, the operations $$+$$ and $$\cdot$$ are defined

$$
\begin{align}
[0] + [0] = [0+0] = [0]\\
[0] + [1] = [0+1] = [1]\\
[0] + [2] = [0+2] = [2]\\
[1] + [0] = [1+0] = [1]\\
[1] + [1] = [1+1] = [2]\\
[1] + [2] = [1+2] = [3] = [0]\\
[2] + [0] = [2+0] = [2] = [2]\\
[2] + [1] = [2+1] = [3] = [0]\\
[2] + [2] = [2+2] = [4] = [1]\\
\\
[0] [0] = [0 \cdot 0] = [0]\\
[0] [1] = [0 \cdot 1] = [0]\\
[0] [2] = [0 \cdot 2] = [0]\\
[1] [0] = [1 \cdot 0] = [0]\\
[1] [1] = [1 \cdot 1] = [1]\\
[1] [2] = [1 \cdot 2] = [2]\\
[2] [0] = [2 \cdot 0] = [0]\\
[2] [1] = [2 \cdot 1] = [2]\\
[2] [2] = [2 \cdot 2] = [1]\\
\end{align}
$$

```haskell
modReduce :: Int -> Poly -> Poly
modReduce m = trim . map (`mod` m)

trim :: Poly -> Poly
trim [] = [0]
trim x = trim' (reverse x)
  where trim' [] = [0]
        trim' (x:xs)
          | x == 0    = trim' xs
          | otherwise = reverse (x:xs)

degree :: Poly -> Int
degree [] = 0
degree x  = (length . trim $ x) - 1

{-
let char(F) = 2
let f = [0,0,0,0,1] => degree f = 4
let m = [1,1,1] => degree m = 2

T^4 : T^2 + T + 1 = T^2

degree f - degree m
(replicate 0 (degree f - degree m)) ++ [1]

T^4               : T^2 + T + 1 = T^2 + T
T^4 + T^3 + T^2
--------------------
      T^3 + T^2
      T^3 + T^2 + T
      -----------------
                  T

-}
-- given a characteristic m, a polynomial f and a modulus polynomial g
-- compute (remainder, factor) such that f = factor * g + remainder
modP :: Int -> Poly -> Poly -> (Poly, Poly)
modP m f g
  | modReduce m g == [0] = error "Division by zero"
  | otherwise            = modP' f [0]
  where
    dg = degree g
    modP' r c
      | r == [0]       = (r, c)
      | factorP == [0] = (r, c)
      | dr >= dg       = modP' remainder (modReduce m $ plus c factorP)
      | otherwise      = (r, c)

      where
        dr        = degree r
        remainder = modReduce m $ f `minus` (g `multiply` (c `plus` factorP))
        factorP   = modReduce m $ replicate (dr - dg) 0 ++ [factor]
        factor    = max 1 (last r `div` last g)

type Field = ([Poly], [(Poly, Poly, Poly)], [(Poly, Poly, Poly)])

-- given a characteristic p and an irreducible polynomial f, where p is prime
-- compute the field (F_m[T], +, *)
field :: Int -> Poly -> Field
field p f = (elements, additive, multiplicative)
  where
    elements       = genLowerP p (degree f)
    additive       = [ (a,b, addF  p f a b) | a <- elements, b <- elements ]
    multiplicative = [ (a,b, multF p f a b) | a <- elements, b <- elements ]

operate p f op a b = fst (modP p (modReduce p (op a b)) f)

addF :: Int -> Poly -> Poly -> Poly -> Poly
addF p f a b = operate p f plus a b

multF :: Int -> Poly -> Poly -> Poly -> Poly
multF p f a b = operate p f multiply a b

{- Example output for field 2 [1,1,1]

([[0],[1],[0,1],[1,1]],

 [([0],[0],[0]),     ([0],[1],[1]),     ([0],[0,1],[0,1]), ([0],[1,1],[1,1]),
  ([1],[0],[1]),     ([1],[1],[0]),     ([1],[0,1],[1,1]), ([1],[1,1],[0,1]),
  ([0,1],[0],[0,1]), ([0,1],[1],[1,1]), ([0,1],[0,1],[0]), ([0,1],[1,1],[1]),
  ([1,1],[0],[1,1]), ([1,1],[1],[0,1]), ([1,1],[0,1],[1]), ([1,1],[1,1],[0])],

 [([0],[0],[0]),   ([0],[1],[0]),     ([0],[0,1],[0]),       ([0],[1,1],[0]),
  ([1],[0],[0]),   ([1],[1],[1]),     ([1],[0,1],[0,1]),     ([1],[1,1],[1,1]),
  ([0,1],[0],[0]), ([0,1],[1],[0,1]), ([0,1],[0,1],[0,0,1]), ([0,1],[1,1],[0,1,1]),
  ([1,1],[0],[0]), ([1,1],[1],[1,1]), ([1,1],[0,1],[0,1,1]), ([1,1],[1,1],[1,0,1])])
-}

fieldX p f = let (es,_,_) = field p f in filter (/= [0]) es
```

**Try this:**

a) Construct the finite field $$\mathbb{F}_2[T]/(T+1)$$.

b) Construct the finite field $$\mathbb{F}_9 = \mathbb{F}_3[T]/(2T^2+2T+1)$$.

## Cryptosystems over finite fields

A cryptosystem is defined as a tuple
$$(\mathcal{P}, \mathcal{C}, \mathcal{K}, \mathcal{E}, \mathcal{D})$$ where
$$\mathcal{P}$$ is the set of plain texts, $$\mathcal{C}$$ is the set of cipher texts,
$$\mathcal{K}$$ is the set of keys,
$$\mathcal{E}$$ is the set of functions $$E_k: \mathcal{P} \rightarrow \mathcal{C} $$ for all $$ k \in \mathcal{K}$$,
and $$\mathcal{D}$$ is the set of functions $$D_k: \mathcal{C} \rightarrow \mathcal{P}$$ for all $$ k \in \mathcal{K}$$
such that it is $$d_k(e_k(p)) = p$$ for all $$p \in \mathcal{P}, e_k \in \mathcal{E}, d_k \in \mathcal{D}$$.
The functions $$e_k, d_k$$ for all $$k \in \mathcal{K}$$ are required to be injective.
If the sets $$\mathcal{P}$$ and $$\mathcal{C}$$ are finite then the functions $$e_k, d_k$$
for all $$k \in \mathcal{K}$$ are surjective and thus, in this case, these functions would
be bijective.

### Diffie-Hellman key exchange
The goal of this method is to securely exchange cryptographic keys. Strictly
speaking, this method is not a cryptosystem since it is not meant to be used for
encrypted message transportation. Usually, this method is combined with a
cryptosystem - for instance symmetric cryptosystem -, where the key
for the cryptosystem is securely transferred using the
[Diffie-Hellman key exchange][DiffieHellmanKE] method.

In order to apply this method, you first need to define a finite field
$$\mathbb{F}$$ and find a generator $$g$$ in $$\mathbb{F}^{\times}$$ and make
both, the finite field and the generator, public.
Now, assume Alice wants to agree with Bob on a key to use for
further message encryption/decryption using a cryptosystem.
First of all, both parties need to agree on how to transform a given element in
$$\mathbb{F}^{\times}$$ to an integer, matrix and so on. Then, Alice chooses an
integer $$a \in \mathbb{Z}$$. Note, that if Alice chooses $$a=1$$ then it will
be simply $$g^1=g$$ or in case of $$a=|\mathbb{F}^{\times}|$$ it will be
[$$g^{|\mathbb{F}^{\times}|} = 1$$][OrdOfElDividesOrdOfGroup]
since $$g$$ is the generator and $$\mathbb{F}^{\times}$$ has
$$|\mathbb{F}^{\times}|$$ elements so after applying the multiplication of $$g$$
with $$g$$ itself $$|\mathbb{F}^{\times}|$$ times, the neutral element $$1$$
will have been reached. After all, Alice calculates $$g^a$$ after choosing a
random $$1<a<|\mathbb{F}^{\times}| \in \mathbb{Z}$$.
She sends the resulting element to Bob.
Bob, also does the same. He chooses a random
$$1<b<|\mathbb{F}^{\times}| \in \mathbb{Z}$$ and calculates $$g^b$$ and sends
the resulting element in $$\mathbb{F}^{\times}$$ to Alice.
Now, both, Alice and Bob, can compute $$(g^a)^b = g^{ab} = g^{ba} = (g^b)^a$$.
The element $$(g^a)^b = (g^b)^a \in \mathbb{F}^{\times}$$ is the secret key
which has been exchanged between Alice and Bob.

Now Oscar may have eavesdropped both calculated elements, $$g^a$$ and $$g^b$$.
If Oscar knows how to solve the DLP in a finite field $$\mathbb{F}$$, then
he will also be able to calculate the discrete logarithms $$a$$ and $$b$$
whereupon he can calculate $$g^{ab}$$. However, it is assumed, that if Oscar
can break the Diffie-Hellman key exchange then he also can solve the DLP over
finite fields.

```haskell
generator :: Int -> Poly -> Poly
generator p f = fst . head . (filter ((==q-1) . snd)) $ (map (\x -> (x, ordP p f x)) es)
  where
    q = p ^ (degree f)
    es = fieldX p f

powF :: Int -> Poly -> Poly -> Int -> Poly
powF p f b e =  powF' b (e `mod` (q - 1))
  where
    q = p ^ (degree f)

    powF' :: Poly -> Int -> Poly
    powF' acc 0 = [1]
    powF' acc 1 = acc
    powF' acc e = powF' (multF p f acc b) (e-1)

-- demonstrates diffie hellman key exchange
-- p is the characteristic of the field
-- f is the irreducible polynomial
-- g is the generator of the multiplicative group
-- a and b are random integer values 1 < a,b < | F^x |
dh_demo p f g a b = (ga, gb, powF p f ga b, powF p f gb a, powF p f g (a*b))
  where ga = powF p f g a
        gb = powF p f g b

-- p char of field, n degree of irreducibles polynomial, a and b integers
-- compute key
dh p n a b = powF p f g (a*b)
  where f = head (irreduciblesP p n)
        g = generator p f
```

### Massey-Omura
The [Massey-Omura cryptosystem][MasseyOmura] can be used to encrypt/decrypt messages.
Let $$\mathbb{F}$$ be a finite field with $$q = p^n$$ elements
where $$p$$ is prime and $$n \in \mathbb{N}$$.
Then the multiplicative group $$\mathbb{F}^{\times}$$ contains $$q-1$$ elements.
The elements of $$\mathbb{F}^{\times}$$ represent the messages to send.
Alice and Bob need to agree on a way how to map a message in a certain language to
elements in the group $$\mathbb{F}^{\times}$$ and back.
Let $$M \in \mathbb{F}^{\times}$$ be the message to send.
The field $$\mathbb{F}$$ is made public. Alice chooses a random natural number
$$e_A \in \mathbb{N}$$ where it is reasonably $$1 \lt e_A \lt q-1$$ and
$$\text{gcd}(e_A, q - 1) = 1$$. The condition that the greatest common divisor of
$$e_A$$ and $$q-1$$ is $$1$$ is required in order to find an inverse
$$d_A \in \mathbb{Z}$$ of $$e_A$$ such that it is $$e_Ad_A \equiv 1 (\text{mod} q-1)$$.
Bob, also chooses a random natural number $$e_B \in \mathbb{N}$$ meaningfully
$$1 \lt e_B \lt q-1$$ and $$\text{gcd}(e_B, q-1) = 1$$ such that there exists a
$$d_B \in \mathbb{Z}$$ with $$e_Bd_B \equiv 1 (\text{mod} q-1)$$.
Then, Alice calculates $$M^{e_A} \in \mathbb{F}^{\times}$$ and sends the result to Bob.
Bob calculates $$(M^{e_A})^{e_B} = M^{e_Ae_B}$$ and sends this back to Alice.
Alice, then calculates $$(M^{e_Ae_B})^{d_A} = M^{e_Ae_Bd_A} = M^{e_Ad_Ae_B}$$.
Recall, that for a finite group $$G$$ it is [$$g^{|G|} = e$$][OrdOfElDividesOrdOfGroup]
for all $$g \in G$$ where $$e$$ is the neutral element.
Since it is $$e_Ad_A \equiv 1 (\text{mod} q-1)$$ it follows
$$e_Ad_A = 1 + c(q-1)$$ for some $$c \in \mathbb{Z}$$
and thus substituting $$e_Ad_A$$ by $$1+c(q-1)$$ yields

$$
\begin{align}
M^{e_Ad_A} &= M^{1+c(q-1)}\\
           &= MM^{c(q-1)}\\
           &= M(M^{q-1})^c\\
           &= M \cdot 1^c\\
           &= M \in \mathbb{F}^{\times}.
\end{align}
$$

Thus, it is $$M^{e_Ae_Bd_A} = (M^{e_Ad_A})^{e_B} = M^{e_B} \in \mathbb{F}^{\times}$$.
Alice sends $$M^{e_B} \in \mathbb{F}^{\times}$$ to Bob.
Bob, then calculates

$$
\begin{align}
(M^{e_B})^{d_B} &= M^{e_Bd_B}\\
                &= M^{1+k(q-1)} &&\text{ for some } k \in \mathbb{Z}\\
                &= MM^{k(q-1)}\\
                &= M(M^{q-1})^k\\
                &= M \cdot 1^k\\
                &= M \in \mathbb{F}^{\times}.
\end{align}
$$

If Oscar knows how to solve the DLP he can break the Massey-Omura cryptosystem.
It is _assumed_ that Oscar cannot break the cryptosystem without solving the DLP.

```haskell
{- The extended euclidean algorithm:

r0    = a        = (s0=1)       * a + (t0=0)       * b |
r1    = b        = (s1=0)       * a + (t1=1)       * b | q = r0 div r1
-------------------------------------------------------+---------------
r2    = r0-q*r1  = (s2=s0-q*s1) * a + (t2=t0-q*t1) * b | q = r1 div r2
-------------------------------------------------------+---------------
                      ...                              | ...
-------------------------------------------------------+---------------
r_n-1 = gcd a b  = s_n-1        * a + t_n-1        * b | ...
-------------------------------------------------------+---------------
r_n=0 = r_n-2    = (s_n-2       * a + (t_n-1       * b |
        -q*r_n-1    -q*s_n-1)          -q*t_n-1)                       -}

-- given two integers a and b
-- compute (s,t,gcd)
-- with respect to sa + tb = gcd
xgcd :: Int -> Int -> (Int,Int,Int)
xgcd a b = xgcd' a 1 0 0
                 b 0 1 (a `div` b)
    where
      xgcd' :: Int -> Int -> Int -> Int ->
               Int -> Int -> Int -> Int -> (Int,Int,Int)
      xgcd' g  s  t  _
            0  _  _  _  = (s,t,g)
      xgcd' r0 s0 t0 _
            r1 s1 t1 q1 = xgcd' r1 s1 t1 q1
                                r2 s2 t2 q2
          where
            r2 = r0 - q1*r1
            s2 = s0 - q1*s1
            t2 = t0 - q1*t1
            q2 = r1 `div` r2

-- Massey-Omura encryption/decryption
mo :: Int -> Int -> Poly -> Int -> Poly
mo p n m x = powF p f m x
  where f = head (irreduciblesP p n)
```

Example usage:

```haskell
let p = 2; n = 10; q = p^n
let f = head (irreduciblesP p n)
let fX = fieldX p f
let eA = 712; (dA,_,_) = xgcd eA (q-1)
let eB = 949; (dB,_,_) = xgcd eB (q-1)
let m = fX !! 123       -- some element for encryption/decryption
let em1 = mo p n m   eA -- Alice sends em1 to Bob
let em2 = mo p n em1 eB -- Bob sends em2 to Alice
let em3 = mo p n em2 dA -- Alice sends em3 to Bob
let dm  = mo p n em3 dB -- Bob decrypts message
m == dm
```

[Warning][MasseyOmuraWarn]: If Oscar plays the man-in-the-middle and eavesdrops the
$$M^{e_A}$$ from Alice he simply can choose his own $$e_O$$ - again with respect to
$$\text{gcd}(e_O, q-1)=1$$ and sends back $$M^{e_Ae_O}$$ to Alice.
Whereupon Alice sends $$M^{e_O}$$ to Oscar while thinking that she is sending
$$M^{e_B}$$ to Bob. Then Oscar can decrypt $$M^{e_O}$$ as Bob would do with $$M^{e_B}$$.
In order to not let Bob or Alice notice anything, Oscar can continue to send encrypted
messages to Bob. So, Oscar can send $$M^{e_O}$$ to Bob, whereupon Bob sends back
$$M^{e_Oe_B}$$ and Oscar, finally, sends $$M^{e_B}$$ to Bob.
In order to prevent Oscar from eavesdropping here, one needs to do authentication.
With authentication and integrity methods Alice can make sure that the messages she
receives are really from Bob. The topic here is to ensure that a message from a sender
S is really from the sender S. The other topic is to ensure that a message has not been
modified when transferring the message.

### ElGamal
The ElGamal cryptosystem can be used for encrypting/decrypting messages. Similar to the
previously described cryptosystem, in this method a finite field $$\mathbb{F}^{\times}$$
with $$q$$ elements together with a primitive element $$g \in \mathbb{F}^{\times}$$
is made public.
Furthermore, Bob - who wants to receive a message from Alice - calculates
$$g^b \in \mathbb{F}^{\times}$$ for a random
$$b \in \mathbb{N}$$ with $$1 \lt b \lt q-1$$. Bob makes $$g^b$$ public.
Alice wants to send a message $$M \in \mathbb{F}^{\times}$$ to Bob.
In order to so, Alice sends Bob the tuple $$(g^a, Mg^{ba})$$ where $$a$$ is a random
natural number with $$1 \lt a \lt q-1$$.
Bob, who knows $$b$$ calculates

$$(g^a)^{q-1-b} = g^{a(q-1) - ab} = (g^{q-1})^a g^{-ab} = g^{-ab}$$

and finally Bob can calculate
$$g^{-ab}Mg^{ba}=g^{-ab}g^{ab}M=g^{ab-ab}M=g^0M=M \in \mathbb{F}^{\times}$$.

Now, Oscar could eavesdrop $$g^b, g^a, Mg^{ab}$$. In order to see $$M$$, Oscar would need
to calculate $$b$$ and $$a$$ which would mean that he could solve the DLP. Also in this
method, it is _assumed_ that it is required to solve DLP in order to break the
cryptosystem.

```haskell
eg_encrypt :: Int -> Poly -> Poly -> Poly -> Poly -> Int -> (Poly, Poly)
eg_encrypt p f m g gb a = (ga, multF p f m (powF p f gb a))
  where ga = powF p f g a

eg_decrypt :: Int -> Poly -> (Poly, Poly) -> Int -> Poly
eg_decrypt p f (ga, encrypted_m) b = multF p f encrypted_m (powF p f ga (q-1-b))
  where n = degree f
        q = p^n
```

Example of usage:

```haskell
let p = 2; n = 10; q = p^n
let b = 123; a = 321
let f = head $ irreduciblesP p n
let fX = fieldX p f
let m = fX !! 111
let g = generator p f
let gb = powF p f g b
m == eg_decrypt p f (eg_encrypt p f m g gb a) b
```

**Try this:**

You are Oscar. You want to know what Alice has sent to Bob. You already know that
Alice and Bob use the ancient [Caesar cipher][CaesarCipher].
Alice and Bob made the finite field $$\mathbb{F}=\mathbb{F}_2/(1+T+T^2+T^3+T^6+T^7+T^8)$$ public.
Also, they made the primitive element $$g = [T+T^3] \in \mathbb{F}^{\times}$$ public.
You successfully eavesdropped $$g^a=[T^2+T^4+T^5]$$ as well as $$g^b=[T^3,T^4,T^5,T^6,T^7]$$
from their Diffie-Hellman key exchange.
Since there are 255 elements in $$\mathbb{F}^{\times}$$ you guess that the exchanged key
is an alphabet from the ASCII table. The polynomial is interpreted as a bit sequence.
What is the secret key Alice and Bob are using?
What has Alice sent to Bob with `dellepudeldkknwu`?

## Concluding
The cryptosystems, described in this article, eventually only require a cyclic group.
Since the multiplicative group of any finite field is cyclic,
you can take any finite field in order to apply the cryptosystem.
You might take a finite field $$\mathbb{F}_{p}$$, or $$\mathbb{F}_{p^n}$$,
or you choose a big subgroup of an elliptic curve over a finite field which
is cyclic. Concrete examples can help to understand the mechanisms. However, it
is also useful to keep an abstract view on the mechanisms. Having the abstract
way of understanding the mechanisms themselves can bring ideas and open the ways
for the application and discovery of new methods.

A lot of theory has been left out in this article. However, if you have an interest in
understanding more deeply how and why the methods and computations in this article work,
I want to encourage you to take a look at abstract algebra. Studying the fundamentals
can help a lot in order to understand how and why things work. For instance, there
are proofs about finite fields, that the cardinality of finite fields is always the
nth power of a prime number. The theory based on extension fields.
Also, studying the fundamentals can bring ideas and show how to make computations faster.
For instance, in ring theory, you can find the [Chinese remainder theorem][ChineseRemainder].
More specifically, in ring theory, the Chinese remainder theorem can be expressed as a
ring homomorphism. To formulate it informally: when applying the homomorphism a number
can be mapped to a tuple of smaller numbers where each element in the tuple has an own
modulus. Due to the usage of the modulus operation, it is possible to multiply or add
numbers which stay always relatively small and do not grow. After the calculation is
done with the small numbers, the tuple of numbers can be mapped back to one single
number. This is only one example of more possible ideas you might take from taking a
deeper look under the hood of the methods.

[ModMultIsAssoc]: https://proofwiki.org/wiki/Modulo_Multiplication_is_Associative
[SubGroupTest]: https://en.wikipedia.org/wiki/Subgroup_test
[OrderOfGroupElements]: http://groupprops.subwiki.org/wiki/Order_of_an_element
[LagrangeTheorem]: https://en.wikipedia.org/wiki/Lagrange's_theorem_(group_theory)
[Cosets]: https://en.wikipedia.org/wiki/Coset
[GroupHomomorphisms]: http://mathworld.wolfram.com/GroupHomomorphism.html
[GroupHomomorphismProps]: http://www.bookofproofs.org/branches/properties-of-a-group-homomorphism/direct-proof/
[ClassEquation]: http://groupprops.subwiki.org/wiki/Class_equation_of_a_group
[NormalAndQuotientGroups]: https://en.wikibooks.org/wiki/Abstract_Algebra/Group_Theory/Normal_subgroups_and_Quotient_groups
[CentralizerAndNormalizer]: https://books.google.de/books?id=lqyCjUFY6WAC&pg=PA38&lpg=PA38&dq=centralizer+and+normalizer+class+equation&source=bl&ots=aoEap5-4Er&sig=qSU03jaJBlNlGdEWjEri2fzS3fU&hl=de&sa=X&ved=0ahUKEwj83YGugYHRAhUKwBQKHZgBCv44FBDoAQg0MAM#v=onepage&q=centralizer%20and%20normalizer%20class%20equation&f=false
[CyclicGroups]: https://en.wikipedia.org/wiki/Cyclic_group
[CyclicGroupDef]: http://mathworld.wolfram.com/CyclicGroup.html
[PrimeGroupIsCyclic]: https://proofwiki.org/wiki/Prime_Group_is_Cyclic
[MultCyclicFiniteFieldGroup1]: https://books.google.de/books?id=kd24d3mwaecC&pg=PA337&lpg=PA337&dq=every+finite+subgroup+of+the+multiplicative+group+is+cyclic&source=bl&ots=N9u3W67kAg&sig=ruXXi1YVraPA4IzP-IwC1zwG0_E&hl=de&sa=X&ved=0ahUKEwjkydHjkIHRAhXMORQKHccLA_44MhDoAQgeMAA#v=onepage&q=every%20finite%20subgroup%20of%20the%20multiplicative%20group%20is%20cyclic&f=false
[MultCyclicFiniteFieldGroup2]: http://math.stanford.edu/~conrad/210BPage/handouts/math210b-finite-mult-groups-cyclic.pdf
[MultCyclicFiniteFieldGroup3]: https://books.google.de/books?id=njgVUjjO-EAC&pg=PA406&lpg=PA406&dq=every+finite+subgroup+of+the+multiplicative+group+is+cyclic&source=bl&ots=ckj6T1fqt6&sig=NMbAuKMlQSUdhorcPnOTH3pIRw0&hl=de&sa=X&ved=0ahUKEwjKs-Xhj4HRAhWE6RQKHfGhCfk4HhDoAQhMMAY#v=onepage&q=every%20finite%20subgroup%20of%20the%20multiplicative%20group%20is%20cyclic&f=false
[FiniteCyclicSubgroupProps]: http://facstaff.cbu.edu/wschrein/media/M402%20Notes/M402C4.pdf
[Poly]: http://mathworld.wolfram.com/Polynomial.html
[IrrPoly]: http://mathworld.wolfram.com/IrreduciblePolynomial.html
[FastIrrPoly]: https://arxiv.org/pdf/0905.1642.pdf
[FastIrrPoly2]: http://www.shoup.net/papers/detirred.pdf
[Ideal]: http://mathworld.wolfram.com/Ideal.html
[FiniteField]: http://mathworld.wolfram.com/FiniteField.html
[Explicit_construction_of_finite_fields]: https://en.wikipedia.org/wiki/Finite_field#Explicit_construction_of_finite_fields
[ProofPIDCorollary]: https://proofwiki.org/wiki/Polynomial_Forms_over_Field_form_Principal_Ideal_Domain/Corollary_1
[OrdOfElDividesOrdOfGroup]: http://groupprops.subwiki.org/wiki/Order_of_element_divides_order_of_group
[DiffieHellmanKE]: https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange
[MasseyOmura]: https://books.google.de/books?id=QTItdhGfqCcC&pg=PA100&lpg=PA100&dq=massey+omura+cryptosystem&source=bl&ots=-JeciqZRZa&sig=EvpYSU5WukZnVRDI6QfWEbZruKE&hl=de&sa=X&ved=0ahUKEwjk1pjo7fvQAhXE_ywKHZEmD8oQ6AEIZDAI#v=onepage&q=massey%20omura%20cryptosystem&f=false
[MasseyOmuraWarn]: https://en.wikipedia.org/wiki/Three-pass_protocol#Authentication
[ChineseRemainder]: https://en.wikipedia.org/wiki/Chinese_remainder_theorem#Theorem_statement
[CaesarCipher]: https://en.wikipedia.org/wiki/Caesar_cipher
