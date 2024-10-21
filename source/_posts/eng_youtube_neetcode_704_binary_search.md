---
title: yt neetcode lc704 binary search
date: 2024-10-21 02:34:21
tags:
- English
- Algo
- Subtitle
categories:
- English
---


# URL

https://www.youtube.com/watch?v=s4DPM8ct1pI&list=WL&index=1&t=106s



# Read the problem


1
00:00:00,000 --> 00:00:01,680
hey everyone welcome back and let's

2
00:00:01,680 --> 00:00:03,439
write some more neat code today so today

3
00:00:03,439 --> 00:00:05,520
let's solve the problem binary search

4
00:00:05,520 --> 00:00:08,080
we're given an array of integers nums

5
00:00:08,080 --> 00:00:09,599
which are going to be sorted in

6
00:00:09,599 --> 00:00:12,160
ascending order and we're also given a

7
00:00:12,160 --> 00:00:13,920
target integer that we're going to look

8
00:00:13,920 --> 00:00:16,800
for if the target exists in the array

9
00:00:16,800 --> 00:00:18,720
then we can return the index of it if it

10
00:00:18,720 --> 00:00:21,439
does not exist then we return one the

11
00:00:21,439 --> 00:00:23,680
goal is to create an efficient algorithm

12
00:00:23,680 --> 00:00:26,400
that can run in log n time so what

13
00:00:26,400 --> 00:00:28,400
algorithm are we going to use well the

14
00:00:28,400 --> 00:00:30,480
problem pretty much tells you binary

15
00:00:30,480 --> 00:00:33,440
search so while this is self-explanatory

16
00:00:33,440 --> 00:00:35,760
and a pretty basic algorithm i still

17
00:00:35,760 --> 00:00:38,000
think it's really important because a

18
00:00:38,000 --> 00:00:40,960
lot of problems kind of extend the idea

19
00:00:40,960 --> 00:00:42,800
of binary search and then make it even

20
00:00:42,800 --> 00:00:44,640
harder and this is actually a pretty

21
00:00:44,640 --> 00:00:47,039
common interview question to be asked

22
00:00:47,039 --> 00:00:49,520
some variation of binary search so this

23
00:00:49,520 --> 00:00:51,360
is a very good problem to practice and

24
00:00:51,360 --> 00:00:53,199
your goal should be able to implement

25
00:00:53,199 --> 00:00:55,840
binary search very quickly basically as

26
00:00:55,840 --> 00:00:57,760
if you were doing it in your sleep so


# Drawing explanation


27
00:00:57,760 --> 00:00:59,520
i'll try to explain this quickly but

28
00:00:59,520 --> 00:01:02,399
also in a beginner-friendly way so the

29
00:01:02,399 --> 00:01:05,199
input array is sorted the target value

30
00:01:05,199 --> 00:01:08,400
could exist anywhere in this array or it

31
00:01:08,400 --> 00:01:11,200
might not exist at all when we start we

32
00:01:11,200 --> 00:01:13,840
are considering the entire input array

33
00:01:13,840 --> 00:01:15,280
how are we going to do that well we're

34
00:01:15,280 --> 00:01:17,600
going to have two pointers one pointer

35
00:01:17,600 --> 00:01:20,479
is going to be at the leftmost index

36
00:01:20,479 --> 00:01:22,720
which is initially index zero another

37
00:01:22,720 --> 00:01:24,400
pointer is going to be at the rightmost

38
00:01:24,400 --> 00:01:27,040
index these pointers mean that we are

39
00:01:27,040 --> 00:01:29,920
considering the entire range now if we

40
00:01:29,920 --> 00:01:33,200
could only look at one of these values

41
00:01:33,200 --> 00:01:35,119
which one should we look at should we

42
00:01:35,119 --> 00:01:38,000
look at the leftmost if we do that and

43
00:01:38,000 --> 00:01:40,159
we see that it's not equal to the target

44
00:01:40,159 --> 00:01:42,159
then we've only eliminated one

45
00:01:42,159 --> 00:01:44,159
possibility and we still have to search

46
00:01:44,159 --> 00:01:47,200
all of these if we look at the rightmost

47
00:01:47,200 --> 00:01:49,119
similarly it's not the target so we've

48
00:01:49,119 --> 00:01:51,040
only eliminated one possibility we still

49
00:01:51,040 --> 00:01:52,720
have to look at the rest of them but if

50
00:01:52,720 --> 00:01:54,720
we look at the midway point and

51
00:01:54,720 --> 00:01:56,240
technically either of these could be the

52
00:01:56,240 --> 00:01:58,479
midway point the way we calculate it

53
00:01:58,479 --> 00:02:00,719
though is going to be literally taking

54
00:02:00,719 --> 00:02:02,960
the left and right indexes and dividing

55
00:02:02,960 --> 00:02:04,960
them by two which i think will lead us

56
00:02:04,960 --> 00:02:07,680
to this position but approximately the

57
00:02:07,680 --> 00:02:10,479
halfway point why should we look here

58
00:02:10,479 --> 00:02:12,480
well we can compare it to the target

59
00:02:12,480 --> 00:02:14,879
it's not equal to the target so what

60
00:02:14,879 --> 00:02:16,480
does that tell us have we only

61
00:02:16,480 --> 00:02:19,440
eliminated one possibility no because

62
00:02:19,440 --> 00:02:23,120
remember the input array is sorted so if

63
00:02:23,120 --> 00:02:25,520
this is not equal to the target we

64
00:02:25,520 --> 00:02:28,000
should also ask is it smaller than the

65
00:02:28,000 --> 00:02:30,480
target or is it larger than the target

66
00:02:30,480 --> 00:02:32,239
in this case it's smaller than the

67
00:02:32,239 --> 00:02:34,560
target so if this is smaller than the

68
00:02:34,560 --> 00:02:37,519
target then everything to the left of it

69
00:02:37,519 --> 00:02:40,080
is also going to be smaller than the

70
00:02:40,080 --> 00:02:42,239
target so this was our midway point

71
00:02:42,239 --> 00:02:45,120
we'll call it m and we found that it's

72
00:02:45,120 --> 00:02:46,959
smaller than the target so we can

73
00:02:46,959 --> 00:02:49,680
eliminate these three values from

74
00:02:49,680 --> 00:02:52,000
consideration everything over here how

75
00:02:52,000 --> 00:02:53,760
are we gonna you know represent that in

76
00:02:53,760 --> 00:02:55,760
code well we're gonna take this left

77
00:02:55,760 --> 00:02:58,480
pointer and then shift it to be m

78
00:02:58,480 --> 00:03:01,280
plus one so now our left pointer is

79
00:03:01,280 --> 00:03:03,680
gonna be over here this represents

80
00:03:03,680 --> 00:03:05,840
possible range of solutions is going to

81
00:03:05,840 --> 00:03:08,400
lie within you know these two pointers

82
00:03:08,400 --> 00:03:10,319
so at this point we're just going to

83
00:03:10,319 --> 00:03:12,400
repeat the algorithm repeat what i

84
00:03:12,400 --> 00:03:14,560
pretty much just did now if we take

85
00:03:14,560 --> 00:03:16,720
these two add them together divide by

86
00:03:16,720 --> 00:03:19,200
two the middle is going to be over here

87
00:03:19,200 --> 00:03:20,800
so then we're going to check is this

88
00:03:20,800 --> 00:03:22,159
equal to the target that we're looking

89
00:03:22,159 --> 00:03:25,120
for in this case yes it is so now we can

90
00:03:25,120 --> 00:03:27,440
return the index because that's what we

91
00:03:27,440 --> 00:03:29,280
were trying to do we can return m

92
00:03:29,280 --> 00:03:30,720
whatever it happened to be i think it's

93
00:03:30,720 --> 00:03:33,280
4 in this case so that is pretty much

94
00:03:33,280 --> 00:03:36,480
the idea of binary search okay so now

95
00:03:36,480 --> 00:03:38,720
the time complexity if you know binary

96
00:03:38,720 --> 00:03:40,480
search you already know that it runs in

97
00:03:40,480 --> 00:03:42,799
log in time but let's quickly understand

98
00:03:42,799 --> 00:03:44,560
why so we're not considering this

99
00:03:44,560 --> 00:03:47,120
example anymore but suppose we had 16

100
00:03:47,120 --> 00:03:49,840
values in the input array every time we

101
00:03:49,840 --> 00:03:53,120
go to the midway point we either find

102
00:03:53,120 --> 00:03:55,360
the target but if we don't find the

103
00:03:55,360 --> 00:03:56,959
target we know we're at least going to

104
00:03:56,959 --> 00:04:00,159
eliminate half of the possibilities so

105
00:04:00,159 --> 00:04:02,239
we would eliminate this down to a now

106
00:04:02,239 --> 00:04:04,239
we're only looking at eight values we

107
00:04:04,239 --> 00:04:06,159
still don't find the result we keep

108
00:04:06,159 --> 00:04:09,200
dividing it by two make it two remaining

109
00:04:09,200 --> 00:04:12,000
and then finally there would only be

110
00:04:12,000 --> 00:04:15,040
one value remaining and either that's

111
00:04:15,040 --> 00:04:16,959
going to be the target or it's not going

112
00:04:16,959 --> 00:04:18,639
to be the target and then we're pretty

113
00:04:18,639 --> 00:04:20,798
much done with the algorithm anyway so

114
00:04:20,798 --> 00:04:23,840
the question is if we have a while loop

115
00:04:23,840 --> 00:04:26,400
the while loop is going to run as many

116
00:04:26,400 --> 00:04:29,680
times as we can divide the length of the

117
00:04:29,680 --> 00:04:32,720
input array by two how many times can we

118
00:04:32,720 --> 00:04:34,880
divide it by two well if you remember

119
00:04:34,880 --> 00:04:37,440
from your math class that is a math

120
00:04:37,440 --> 00:04:41,919
equation called log base two of n this

121
00:04:41,919 --> 00:04:44,320
evaluates to how many times can we

122
00:04:44,320 --> 00:04:48,000
divide n by 2. and you know suppose it

123
00:04:48,000 --> 00:04:50,400
evaluates to be x that's equivalent to

124
00:04:50,400 --> 00:04:52,320
saying that 2 to the power of x is going

125
00:04:52,320 --> 00:04:54,000
to be equal to n okay but this is too

126
00:04:54,000 --> 00:04:55,759
much math maybe you don't even care but

127
00:04:55,759 --> 00:04:58,080
that's pretty much the idea that's why

128
00:04:58,080 --> 00:05:00,639
our loop is going to run x times which

129
00:05:00,639 --> 00:05:02,720
is going to be equal to log n so it's

130
00:05:02,720 --> 00:05:05,440
not a big o of n algorithm it's a log

131
00:05:05,440 --> 00:05:09,360
base 2 n algorithm which is much much

132
00:05:09,360 --> 00:05:10,560
more efficient


# Coding explanation


133
00:05:10,560 --> 00:05:13,280
okay so now let's code it up and like i

134
00:05:13,280 --> 00:05:14,880
did in the drawing initially we're

135
00:05:14,880 --> 00:05:18,080
considering the entire input array as

136
00:05:18,080 --> 00:05:20,560
our search area so our left pointer is

137
00:05:20,560 --> 00:05:22,240
going to be at zero our right pointer is

138
00:05:22,240 --> 00:05:24,080
going to be at the last index which is

139
00:05:24,080 --> 00:05:26,560
just the length of the array minus 1.

140
00:05:26,560 --> 00:05:28,960
now we want to continue going until

141
00:05:28,960 --> 00:05:31,440
there's no more possibilities left or we

142
00:05:31,440 --> 00:05:33,520
have maybe found the result so the way

143
00:05:33,520 --> 00:05:35,199
to do that is to basically say that

144
00:05:35,199 --> 00:05:37,759
while our left pointer is less than or

145
00:05:37,759 --> 00:05:40,240
equal to our right pointer because i

146
00:05:40,240 --> 00:05:41,680
didn't show it in the drawing picture

147
00:05:41,680 --> 00:05:43,840
but suppose we just had a very small

148
00:05:43,840 --> 00:05:45,360
input array just to illustrate the

149
00:05:45,360 --> 00:05:47,199
example our left and right pointers

150
00:05:47,199 --> 00:05:49,840
would both point here our midpointer

151
00:05:49,840 --> 00:05:52,880
would also point here but suppose our

152
00:05:52,880 --> 00:05:55,759
target is actually equal to two okay

153
00:05:55,759 --> 00:05:58,080
we'd say okay this is too small for our

154
00:05:58,080 --> 00:06:00,479
target so we're gonna set our left

155
00:06:00,479 --> 00:06:04,000
pointer to be equal to mid plus one so

156
00:06:04,000 --> 00:06:06,240
that means our left pointer would be one

157
00:06:06,240 --> 00:06:08,639
and our right pointer would be zero that

158
00:06:08,639 --> 00:06:10,560
basically means our left pointer has

159
00:06:10,560 --> 00:06:12,639
crossed our right pointer and that's how

160
00:06:12,639 --> 00:06:15,120
you know that we have no more values

161
00:06:15,120 --> 00:06:17,039
left to search we did not find the

162
00:06:17,039 --> 00:06:19,360
result so that's why we're doing less

163
00:06:19,360 --> 00:06:21,280
than or equal if they're both equal

164
00:06:21,280 --> 00:06:22,880
though if they're both pointing at this

165
00:06:22,880 --> 00:06:24,800
value that means we haven't looked at

166
00:06:24,800 --> 00:06:27,520
this value yet so that's the idea so

167
00:06:27,520 --> 00:06:28,880
each iteration of the loop we're just

168
00:06:28,880 --> 00:06:30,560
going to find the midway point which we

169
00:06:30,560 --> 00:06:34,479
can get by taking l plus r and dividing

170
00:06:34,479 --> 00:06:38,400
by two if the value that this index is

171
00:06:38,400 --> 00:06:41,199
at is greater than the target then we

172
00:06:41,199 --> 00:06:43,280
want to look at all values to the left

173
00:06:43,280 --> 00:06:44,880
of it so we're gonna take our right

174
00:06:44,880 --> 00:06:47,199
pointer and set it to m minus one we

175
00:06:47,199 --> 00:06:49,360
wanna look at all values to the left

176
00:06:49,360 --> 00:06:51,840
we're basically shrinking our criteria

177
00:06:51,840 --> 00:06:54,880
and in the other case else if that num

178
00:06:54,880 --> 00:06:56,880
is smaller than our target then we're

179
00:06:56,880 --> 00:06:58,319
gonna do the opposite we're gonna set

180
00:06:58,319 --> 00:07:00,960
left equal to mid plus one just like in

181
00:07:00,960 --> 00:07:03,440
the drawing explanation the last case is

182
00:07:03,440 --> 00:07:05,680
if neither of those are true that must

183
00:07:05,680 --> 00:07:07,840
mean that we found the target if it's

184
00:07:07,840 --> 00:07:10,080
not greater and not smaller that means

185
00:07:10,080 --> 00:07:12,000
it must be equal that means we can

186
00:07:12,000 --> 00:07:14,639
return m which is the result but if we

187
00:07:14,639 --> 00:07:16,639
went through every iteration of the loop

188
00:07:16,639 --> 00:07:18,560
and we didn't find the result then

189
00:07:18,560 --> 00:07:21,199
outside of it we are told that we should

190
00:07:21,199 --> 00:07:23,280
return negative one to indicate we did

191
00:07:23,280 --> 00:07:25,680
not find a result so that's the solution

192
00:07:25,680 --> 00:07:27,520
let's run it to make sure that it works

193
00:07:27,520 --> 00:07:29,280
and as you can see on the left yes it

194
00:07:29,280 --> 00:07:31,120
does and it's very efficient there's one

195
00:07:31,120 --> 00:07:32,720
more thing though that i want to mention

196
00:07:32,720 --> 00:07:34,800
to you which probably won't come up in

197
00:07:34,800 --> 00:07:36,639
your interview to be honest it's never

198
00:07:36,639 --> 00:07:38,880
come up in mine but there's actually one

199
00:07:38,880 --> 00:07:41,120
little bug here i mean technically the

200
00:07:41,120 --> 00:07:43,440
bug doesn't exist in python because

201
00:07:43,440 --> 00:07:44,479
python

202
00:07:44,479 --> 00:07:46,560
integers are unbounded they can pretty

203
00:07:46,560 --> 00:07:48,960
much be infinitely large but in most

204
00:07:48,960 --> 00:07:51,599
languages like java and c plus plus you

205
00:07:51,599 --> 00:07:54,400
might encounter an overflow because

206
00:07:54,400 --> 00:07:57,440
suppose we had a very large input array

207
00:07:57,440 --> 00:08:00,639
and then these two integers were very

208
00:08:00,639 --> 00:08:04,000
close to the 32-bit integer max which is

209
00:08:04,000 --> 00:08:05,120
something like

210
00:08:05,120 --> 00:08:07,840
2 to the power of 31 suppose they were

211
00:08:07,840 --> 00:08:09,599
both close to that then adding them

212
00:08:09,599 --> 00:08:12,879
together would possibly overflow and

213
00:08:12,879 --> 00:08:15,599
then we would get the wrong result in

214
00:08:15,599 --> 00:08:16,400
this

215
00:08:16,400 --> 00:08:18,800
value so possibly your interviewer might

216
00:08:18,800 --> 00:08:20,479
ask you something about that and how

217
00:08:20,479 --> 00:08:22,479
would you go about fixing that well

218
00:08:22,479 --> 00:08:24,639
there's actually a way to do that we can

219
00:08:24,639 --> 00:08:26,879
still calculate the midway point between

220
00:08:26,879 --> 00:08:28,879
left and right without adding them

221
00:08:28,879 --> 00:08:31,360
together because we can take the

222
00:08:31,360 --> 00:08:34,000
distance between them we can get the

223
00:08:34,000 --> 00:08:36,479
distance between them by taking right

224
00:08:36,479 --> 00:08:40,958
minus left and then dividing that by two

225
00:08:40,958 --> 00:08:42,958
right that will give us half of the

226
00:08:42,958 --> 00:08:45,519
distance between them and we can take

227
00:08:45,519 --> 00:08:49,279
that and add it to the left index

228
00:08:49,279 --> 00:08:51,200
because if this is halfway of the

229
00:08:51,200 --> 00:08:53,120
distance between them and then this is

230
00:08:53,120 --> 00:08:55,680
the left index by adding these together

231
00:08:55,680 --> 00:08:58,080
we are getting the midway point this is

232
00:08:58,080 --> 00:09:00,000
just a way to do the exact same

233
00:09:00,000 --> 00:09:03,440
calculation but this way it will never

234
00:09:03,440 --> 00:09:05,760
overflow because right is always going

235
00:09:05,760 --> 00:09:08,320
to be greater than or equal to left and

236
00:09:08,320 --> 00:09:09,920
in this case we're not adding them

237
00:09:09,920 --> 00:09:11,680
together we're subtracting them so this

238
00:09:11,680 --> 00:09:13,680
will always be positive or it will be

239
00:09:13,680 --> 00:09:16,240
zero so i'll run it and it does work

240
00:09:16,240 --> 00:09:18,399
pretty much exactly the same as you can

241
00:09:18,399 --> 00:09:19,920
see on the left but this is just

242
00:09:19,920 --> 00:09:21,360
something i think a lot of people don't

243
00:09:21,360 --> 00:09:22,800
talk about and actually i pretty much

244
00:09:22,800 --> 00:09:24,720
never implement it this way people have

245
00:09:24,720 --> 00:09:26,320
actually mentioned that in my comments

246
00:09:26,320 --> 00:09:27,680
before which is kind of why i'm talking

247
00:09:27,680 --> 00:09:29,200
about it today but i really hope that

248
00:09:29,200 --> 00:09:31,200
this was helpful if it was please like

249
00:09:31,200 --> 00:09:32,640
and subscribe it really supports the

250
00:09:32,640 --> 00:09:34,240
channel a lot consider checking out my

251
00:09:34,240 --> 00:09:35,600
patreon where you can further support

252
00:09:35,600 --> 00:09:37,440
the channel and hopefully i'll see you

253
00:09:37,440 --> 00:09:41,040
pretty soon thanks for watching




# 中文翻译


## Read the problem

1
00:00:00,000 --> 00:00:01,680
嘿大家欢迎回来，今天让我们

2
00:00:01,680 --> 00:00:03,439
写一些更简洁的代码，所以今天

3
00:00:03,439 --> 00:00:05,520
让我们解决二分搜索问题，

4
00:00:05,520 --> 00:00:08,080
我们给出了一个整数数组 nums ，

5
00:00:08,080 --> 00:00:09,599
这些整数将按

6
00:00:09,599 --> 00:00:12,160
升序排序，我们还给出了一个

7
00:00:12,160 --> 00:00:13,920
目标整数，我们' 我们将

8
00:00:13,920 --> 00:00:16,800
查找目标是否存在于数组中，

9
00:00:16,800 --> 00:00:18,720
然后我们可以返回它的索引，如果它

10
00:00:18,720 --> 00:00:21,439
不存在，那么我们返回一个

11
00:00:21,439 --> 00:00:23,680
目标是创建一种

12
00:00:23,680 --> 00:00:26,400
可以在 log n 时间内运行的高效算法，那么

13
00:00:26,400 --> 00:00:28,400
我们要采用什么算法 很好地使用这个

14
00:00:28,400 --> 00:00:30,480
问题几乎告诉你二分

15
00:00:30,480 --> 00:00:33,440
搜索，所以虽然这是不言自明的，

16
00:00:33,440 --> 00:00:35,760
也是一个非常基本的算法，但我仍然

17
00:00:35,760 --> 00:00:38,000
认为它非常重要，因为

18
00:00:38,000 --> 00:00:40,960
很多问题都扩展了

19
00:00:40,960 --> 00:00:42,800
二分搜索的想法，然后使它变得更加

20
00:00:42,800 --> 00:00:44,640
困难，这 实际上是一个非常

21
00:00:44,640 --> 00:00:47,039
常见的面试问题，会被问到

22
00:00:47,039 --> 00:00:49,520
一些二分搜索的变体，所以这

23
00:00:49,520 --> 00:00:51,360
是一个非常好的练习问题，

24
00:00:51,360 --> 00:00:53,199
你的目标应该能够

25
00:00:53,199 --> 00:00:55,840
非常快地实现二分搜索，基本上就像

26
00:00:55,840 --> 00:00:57,760
你在睡觉时做的那样，所以


## Drawing explanation

27
00:00:57,760 --> 00:00:59,520
我会 尝试

28
00:00:59,520 --> 00:01:02,399
以初学者友好的方式快速解释这一点，以便对

29
00:01:02,399 --> 00:01:05,199
输入数组进行排序，目标值

30
00:01:05,199 --> 00:01:08,400
可能存在于该数组中的任何位置，或者

31
00:01:08,400 --> 00:01:11,200
可能根本不存在，当我们开始时，我们

32
00:01:11,200 --> 00:01:13,840
正在考虑整个输入数组，

33
00:01:13,840 --> 00:01:15,280
我们将如何 做得好，我们

34
00:01:15,280 --> 00:01:17,600
将有两个指针，一个指针

35
00:01:17,600 --> 00:01:20,479
将位于最左边的索引，

36
00:01:20,479 --> 00:01:22,720
最初索引为零，另一个

37
00:01:22,720 --> 00:01:24,400
指针将位于最右边的索引，

38
00:01:24,400 --> 00:01:27,040
这些指针意味着我们

39
00:01:27,040 --> 00:01:29,920
现在正在考虑整个范围，如果我们

40
00:01:29,920 --> 00:01:33,200
可以的话 只看这些值之一，

41
00:01:33,200 --> 00:01:35,119
我们应该看哪一个，我们应该

42
00:01:35,119 --> 00:01:38,000
看最左边的值吗？如果我们这样做，并且

43
00:01:38,000 --> 00:01:40,159
发现它不等于目标，

44
00:01:40,159 --> 00:01:42,159
那么我们只消除了一种

45
00:01:42,159 --> 00:01:44,159
可能性，我们仍然需要搜索

46
00:01:44,159 --> 00:01:47,200
所有这些值 如果我们看最右边的

47
00:01:47,200 --> 00:01:49,119
类似，它不是目标，所以我们

48
00:01:49,119 --> 00:01:51,040
只消除了一种可能性，我们仍然

49
00:01:51,040 --> 00:01:52,720
必须看其余的，但如果

50
00:01:52,720 --> 00:01:54,720
我们看中间点，从

51
00:01:54,720 --> 00:01:56,240
技术上讲，其中任何一个都可能是

52
00:01:56,240 --> 00:01:58,479
我们的中间点 计算它

53
00:01:58,479 --> 00:02:00,719
实际上是取

54
00:02:00,719 --> 00:02:02,960
左索引和右索引并将

55
00:02:02,960 --> 00:02:04,960
它们除以二，我认为这将导致我们

56
00:02:04,960 --> 00:02:07,680
到达这个位置，但大约是

57
00:02:07,680 --> 00:02:10,479
中间点为什么我们应该在这里

58
00:02:10,479 --> 00:02:12,480
仔细观察我们可以将它与

59
00:02:12,480 --> 00:02:14,879
它不等于的目标进行比较 目标那么这

60
00:02:14,879 --> 00:02:16,480
告诉我们我们是否

61
00:02:16,480 --> 00:02:19,440
只消除了一种可能性“否”，因为

62
00:02:19,440 --> 00:02:23,120
记住输入数组是排序的，所以如果

63
00:02:23,120 --> 00:02:25,520
它不等于目标，我们

64
00:02:25,520 --> 00:02:28,000
还应该问它是小于

65
00:02:28,000 --> 00:02:30,480
目标还是大

66
00:02:30,480 --> 00:02:32,239
于此中的目标 如果它小于

67
00:02:32,239 --> 00:02:34,560
目标，那么如果它小于

68
00:02:34,560 --> 00:02:37,519
目标，那么它左边的所有内容

69
00:02:37,519 --> 00:02:40,080
也将小于

70
00:02:40,080 --> 00:02:42,239
目标，所以这是我们的中点，

71
00:02:42,239 --> 00:02:45,120
我们将其称为 m，我们发现它

72
00:02:45,120 --> 00:02:46,959
小于 目标，这样我们就可以

73
00:02:46,959 --> 00:02:49,680
从考虑这里的所有内容中消除这三个值，

74
00:02:49,680 --> 00:02:52,000

75
00:02:52,000 --> 00:02:53,760
我们如何知道在代码中表示，

76
00:02:53,760 --> 00:02:55,760
我们将采用这个左

77
00:02:55,760 --> 00:02:58,480
指针，然后将其移动为 m

78
00:02:58,480 --> 00:03:01,280
加一，所以现在我们的左指针

79
00:03:01,280 --> 00:03:03,680
将结束 这里这表示

80
00:03:03,680 --> 00:03:05,840
可能的解决方案范围将

81
00:03:05,840 --> 00:03:08,400
位于您知道这两个指针的范围内，

82
00:03:08,400 --> 00:03:10,319
因此此时我们只需

83
00:03:10,319 --> 00:03:12,400
重复该算法，重复我

84
00:03:12,400 --> 00:03:14,560
现在所做的，如果我们将这

85
00:03:14,560 --> 00:03:16,720
两个值相加，然后除以

86
00:03:16,720 --> 00:03:19,200
二 中间将在这里，

87
00:03:19,200 --> 00:03:20,800
所以我们将检查这是否

88
00:03:20,800 --> 00:03:22,159
等于我们

89
00:03:22,159 --> 00:03:25,120
在本例中寻找的目标，是的，所以现在我们可以

90
00:03:25,120 --> 00:03:27,440
返回索引，因为这就是我们

91
00:03:27,440 --> 00:03:29,280
想要做的，我们可以 返回 m

92
00:03:29,280 --> 00:03:30,720
无论它发生了什么我认为

93
00:03:30,720 --> 00:03:33,280
在这种情况下它是 4 所以这几乎是

94
00:03:33,280 --> 00:03:36,480
二分搜索的想法好吧所以现在

95
00:03:36,480 --> 00:03:38,720
时间复杂度如果你知道二分

96
00:03:38,720 --> 00:03:40,480
搜索你已经知道它在

97
00:03:40,480 --> 00:03:42,799
登录时间内运行但让我们快速理解

98
00:03:42,799 --> 00:03:44,560
为什么 所以我们不再考虑这个

99
00:03:44,560 --> 00:03:47,120
例子，但假设

100
00:03:47,120 --> 00:03:49,840
每次我们到达中点时，输入数组中有 16 个值，

101
00:03:49,840 --> 00:03:53,120
我们要么找到

102
00:03:53,120 --> 00:03:55,360
目标，但如果找不到

103
00:03:55,360 --> 00:03:56,959
目标，我们知道我们至少会去

104
00:03:56,959 --> 00:04:00,159
消除一半的可能性，所以

105
00:04:00,159 --> 00:04:02,239
我们将消除这种情况现在

106
00:04:02,239 --> 00:04:04,239
我们只查看八个值我们

107
00:04:04,239 --> 00:04:06,159
仍然找不到结果我们继续将

108
00:04:06,159 --> 00:04:09,200
其除以二使其剩下两个

109
00:04:09,200 --> 00:04:12,000
然后最后只剩下

110
00:04:12,000 --> 00:04:15,040
一个值 要么这

111
00:04:15,040 --> 00:04:16,959
将成为目标，要么它不会

112
00:04:16,959 --> 00:04:18,639
成为目标，然后我们就基本上

113
00:04:18,639 --> 00:04:20,798
完成了算法，所以

114
00:04:20,798 --> 00:04:23,840
问题是，如果我们有一个 while 循环，那么

115
00:04:23,840 --> 00:04:26,400
while 循环将运行与

116
00:04:26,400 --> 00:04:29,680
我们一样多的次数 可以将

117
00:04:29,680 --> 00:04:32,720
输入数组的长度除以二

118
00:04:32,720 --> 00:04:34,880
如果你记得

119
00:04:34,880 --> 00:04:37,440
数学课上有一个数学

120
00:04:37,440 --> 00:04:41,919
方程，称为对数以 n 为底的二，那么我们可以将它除以多少次，它的

121
00:04:41,919 --> 00:04:44,320
计算结果是我们可以

122
00:04:44,320 --> 00:04:48,000
将 n 除以 2 多少次 你知道，假设它的

123
00:04:48,000 --> 00:04:50,400
计算结果是 x，这相当于

124
00:04:50,400 --> 00:04:52,320
说 2 的 x 次方将

125
00:04:52,320 --> 00:04:54,000
等于 n 好吧，但这

126
00:04:54,000 --> 00:04:55,759
太多了，也许你甚至不关心，但这

127
00:04:55,759 --> 00:04:58,080
就是为什么的想法。

128
00:04:58,080 --> 00:05:00,639
我们的循环将运行 x 次，这

129
00:05:00,639 --> 00:05:02,720
将等于 log n，所以它

130
00:05:02,720 --> 00:05:05,440
不是一个很大的 o of n 算法，而是一个以 log

131
00:05:05,440 --> 00:05:09,360
为底的 2 n 算法，

132
00:05:09,360 --> 00:05:10,560
效率要高得多，


## Coding explanation

133
00:05:10,560 --> 00:05:13,280
好吧，现在让我们像我一样对其进行编码

134
00:05:13,280 --> 00:05:14,880
在图中，最初我们将

135
00:05:14,880 --> 00:05:18,080
整个输入数组视为

136
00:05:18,080 --> 00:05:20,560
我们的搜索区域，因此我们的左指针

137
00:05:20,560 --> 00:05:22,240
将为零，我们的右指针

138
00:05:22,240 --> 00:05:24,080
将位于最后一个索引，

139
00:05:24,080 --> 00:05:26,560
即数组的长度减 1。

140
00:05:26,560 --> 00:05:28,960
现在我们 想要继续下去，直到

141
00:05:28,960 --> 00:05:31,440
没有更多的可能性，或者我们

142
00:05:31,440 --> 00:05:33,520
可能找到了结果，所以

143
00:05:33,520 --> 00:05:35,199
这样做的方法基本上是说，

144
00:05:35,199 --> 00:05:37,759
虽然我们的左指针小于或

145
00:05:37,759 --> 00:05:40,240
等于我们的右指针，因为我

146
00:05:40,240 --> 00:05:41,680
没有在 画图

147
00:05:41,680 --> 00:05:43,840
但是假设我们只有一个非常小的

148
00:05:43,840 --> 00:05:45,360
输入数组只是为了说明这个

149
00:05:45,360 --> 00:05:47,199
例子我们的左指针和右指针

150
00:05:47,199 --> 00:05:49,840
都会指向这里我们的中指针

151
00:05:49,840 --> 00:05:52,880
也会指向这里但是假设我们的

152
00:05:52,880 --> 00:05:55,759
目标实际上等于二好吧

153
00:05:55,759 --> 00:05:58,080
我们会说好吧这也是 对于我们的目标来说很小，

154
00:05:58,080 --> 00:06:00,479
所以我们将把左

155
00:06:00,479 --> 00:06:04,000
指针设置为等于 mid 加一，

156
00:06:04,000 --> 00:06:06,240
这意味着我们的左指针将是 1

157
00:06:06,240 --> 00:06:08,639
，我们的右指针将是 0，这

158
00:06:08,639 --> 00:06:10,560
基本上意味着我们的左指针已经

159
00:06:10,560 --> 00:06:12,639
穿过了我们的右指针，这就是如何

160
00:06:12,639 --> 00:06:15,120
你知道我们没有更多的值可供

161
00:06:15,120 --> 00:06:17,039
搜索，我们没有找到

162
00:06:17,039 --> 00:06:19,360
结果，所以这就是为什么

163
00:06:19,360 --> 00:06:21,280
如果它们都相等，我们就会做小于或等于，

164
00:06:21,280 --> 00:06:22,880
但如果它们都指向这个

165
00:06:22,880 --> 00:06:24,800
值，这意味着我们还没有 查看了

166
00:06:24,800 --> 00:06:27,520
这个值，这就是想法，因此

167
00:06:27,520 --> 00:06:28,880
循环的每次迭代我们只需

168
00:06:28,880 --> 00:06:30,560
找到中间点，

169
00:06:30,560 --> 00:06:34,479

170
00:06:34,479 --> 00:06:38,400
如果该索引所在的值

171
00:06:38,400 --> 00:06:41,199
大于 目标然后我们

172
00:06:41,199 --> 00:06:43,280
想要查看它左侧的所有值，

173
00:06:43,280 --> 00:06:44,880
因此我们将使用右

174
00:06:44,880 --> 00:06:47,199
指针并将其设置为 m 减一我们

175
00:06:47,199 --> 00:06:49,360
想要查看左侧的所有值

176
00:06:49,360 --> 00:06:51,840
我们基本上缩小了我们的标准，

177
00:06:51,840 --> 00:06:54,880
而在另一个 否则，如果该 num

178
00:06:54,880 --> 00:06:56,880
小于我们的目标，那么我们

179
00:06:56,880 --> 00:06:58,319
将做相反的事情，我们将设置

180
00:06:58,319 --> 00:07:00,960
left 等于 mid 加一，就像

181
00:07:00,960 --> 00:07:03,440
绘图中的解释一样，最后一种情况是，

182
00:07:03,440 --> 00:07:05,680
如果这两个都不成立，那一定

183
00:07:05,680 --> 00:07:07,840
意味着我们 找到目标，如果它

184
00:07:07,840 --> 00:07:10,080
不大于也不小于，这意味着

185
00:07:10,080 --> 00:07:12,000
它必须相等，这意味着我们可以

186
00:07:12,000 --> 00:07:14,639
返回 m，它是结果，但如果我们

187
00:07:14,639 --> 00:07:16,639
经历了循环的每次迭代

188
00:07:16,639 --> 00:07:18,560
并且我们没有找到结果，那么

189
00:07:18,560 --> 00:07:21,199
我们就在它之外 告诉我们应该

190
00:07:21,199 --> 00:07:23,280
返回负数以表明我们

191
00:07:23,280 --> 00:07:25,680
没有找到结果，这就是解决方案

192
00:07:25,680 --> 00:07:27,520
让我们运行它以确保它有效，

193
00:07:27,520 --> 00:07:29,280
正如您在左侧看到的那样，是

194
00:07:29,280 --> 00:07:31,120
的，它确实有效，而且非常有效，

195
00:07:31,120 --> 00:07:32,720
但还有一件事我 我想向

196
00:07:32,720 --> 00:07:34,800
你提一下，这可能不会在

197
00:07:34,800 --> 00:07:36,639
你的面试中出现，说实话，它从来没有

198
00:07:36,639 --> 00:07:38,880
出现在我的面试中，但这里实际上有一个

199
00:07:38,880 --> 00:07:41,120
小错误，我的意思是从技术上讲，这个

200
00:07:41,120 --> 00:07:43,440
错误在 python 中不存在，因为

201
00:07:43,440 --> 00:07:44,479
python

202
00:07:44,479 --> 00:07:46,560
整数是无界的，它们可以很漂亮。

203
00:07:46,560 --> 00:07:48,960
很多是无限大的，但在大多数

204
00:07:48,960 --> 00:07:51,599
语言中，如 java 和 c plus plus，你

205
00:07:51,599 --> 00:07:54,400
可能会遇到溢出，因为

206
00:07:54,400 --> 00:07:57,440
假设我们有一个非常大的输入数组

207
00:07:57,440 --> 00:08:00,639
，然后这两个整数非常

208
00:08:00,639 --> 00:08:04,000
接近 32 位整数最大值，类似于

209
00:08:04,000 --> 00:08:05,120

210
00:08:05,120 --> 00:08:07,840
2 的 31 的幂假设它们都

211
00:08:07,840 --> 00:08:09,599
接近这个值，那么将它们加

212
00:08:09,599 --> 00:08:12,879
在一起可能会溢出，

213
00:08:12,879 --> 00:08:15,599
然后我们会得到

214
00:08:15,599 --> 00:08:16,400
这个

215
00:08:16,400 --> 00:08:18,800
值的错误结果，所以你的面试官可能会

216
00:08:18,800 --> 00:08:20,479
问你一些关于这个的问题，

217
00:08:20,479 --> 00:08:22,479
你会如何解决这个问题，

218
00:08:22,479 --> 00:08:24,639
实际上有一个 为此，我们

219
00:08:24,639 --> 00:08:26,879
仍然可以计算

220
00:08:26,879 --> 00:08:28,879
左和右之间的中点，而无需将它们加

221
00:08:28,879 --> 00:08:31,360
在一起，因为我们可以计算

222
00:08:31,360 --> 00:08:34,000
它们之间的距离，我们可以

223
00:08:34,000 --> 00:08:36,479
通过右

224
00:08:36,479 --> 00:08:40,958
减左，然后除以

225
00:08:40,958 --> 00:08:42,958
右二来得到它们之间的距离

226
00:08:42,958 --> 00:08:45,519
它们之间距离的一半，我们可以将

227
00:08:45,519 --> 00:08:49,279
其添加到左侧索引，

228
00:08:49,279 --> 00:08:51,200
因为如果这是

229
00:08:51,200 --> 00:08:53,120
它们之间距离的一半，那么这是

230
00:08:53,120 --> 00:08:55,680
左侧索引，通过将它们加在一起，

231
00:08:55,680 --> 00:08:58,080
我们得到中点，这

232
00:08:58,080 --> 00:09:00,000
只是一种方法 进行完全相同的

233
00:09:00,000 --> 00:09:03,440
计算，但这样它就永远不会

234
00:09:03,440 --> 00:09:05,760
溢出，因为右总是

235
00:09:05,760 --> 00:09:08,320
大于或等于左，

236
00:09:08,320 --> 00:09:09,920
在这种情况下，我们不会将它们加

237
00:09:09,920 --> 00:09:11,680
在一起，而是将它们相减，所以这

238
00:09:11,680 --> 00:09:13,680
将始终是正数，或者它 将

239
00:09:13,680 --> 00:09:16,240
为零，所以我将运行它，它的工作原理与

240
00:09:16,240 --> 00:09:18,399
您

241
00:09:18,399 --> 00:09:19,920
在左侧看到的几乎完全相同，但这只是

242
00:09:19,920 --> 00:09:21,360
我认为很多人不会

243
00:09:21,360 --> 00:09:22,800
谈论的事情，实际上我几乎

244
00:09:22,800 --> 00:09:24,720
从未实现过它 人们

245
00:09:24,720 --> 00:09:26,320
实际上在我之前的评论中提到过这一点，

246
00:09:26,320 --> 00:09:27,680
这就是我

247
00:09:27,680 --> 00:09:29,200
今天谈论它的原因，但我真的希望

248
00:09:29,200 --> 00:09:31,200
这会有所帮助，如果它是请喜欢

249
00:09:31,200 --> 00:09:32,640
并订阅它真的支持该

250
00:09:32,640 --> 00:09:34,240
频道，请考虑查看我的

251
00:09:34,240 --> 00:09:35,600
赞助人在哪里 您可以进一步支持

252
00:09:35,600 --> 00:09:37,440
该频道，希望很快就能见到您，

253
00:09:37,440 --> 00:09:41,040
感谢您的观看

