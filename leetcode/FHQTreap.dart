import 'dart:math';

abstract class TreeNode<V extends Comparable> {
  bool get isEmpty;
  int get size;
  V? get minOrNull;
  V? get maxOrNull;
  FHQTreapNode<V> insert(V v);
  TreeNode<V> remove(V v);
  bool contains(V v);
  Iterable<FHQTreapNode<V>> inorder();
  TreeNodePieces<V> split(V v);
  TreeNode<V> merge(TreeNode<V> other);
}

class TreeNodePieces<V extends Comparable> {
  TreeNode<V> smaller;
  TreeNode<V> identical;
  TreeNode<V> larger;
  TreeNodePieces(
      {required this.smaller, required this.identical, required this.larger});
}

class EmptyTreeNode<V extends Comparable> implements TreeNode<V> {
  static final random = Random();
  bool get isEmpty => true;
  int get size => 0;
  V? get minOrNull => null;
  V? get maxOrNull => null;
  FHQTreapNode<V> insert(V v) => FHQTreapNode(
      value: v,
      left: EmptyTreeNode(),
      right: EmptyTreeNode(),
      weight: 1,
      rank: random.nextDouble());
  TreeNode<V> remove(V v) => this;
  bool contains(V v) => false;
  Iterable<FHQTreapNode<V>> inorder() sync* {}
  TreeNodePieces<V> split(V v) => TreeNodePieces<V>(
      smaller: EmptyTreeNode(),
      identical: EmptyTreeNode(),
      larger: EmptyTreeNode());
  TreeNode<V> merge(TreeNode<V> other) => other;
}

class FHQTreapNode<V extends Comparable> implements TreeNode<V> {
  V value;
  double rank;
  int weight;
  int size;
  TreeNode<V> left;
  TreeNode<V> right;

  bool get isEmpty => false;
  V? get minOrNull => left.isEmpty ? value : left.minOrNull;
  V? get maxOrNull => right.isEmpty ? value : right.maxOrNull;
  FHQTreapNode<V> insert(V v) {
    final pieces = split(v),
        smaller = pieces.smaller,
        identical = pieces.identical,
        larger = pieces.larger;
    return identical is FHQTreapNode<V>
        ? FHQTreapNode<V>(
                value: v,
                left: EmptyTreeNode(),
                right: EmptyTreeNode(),
                weight: identical.weight + 1,
                rank: identical.rank)
            .merge(smaller)
            .merge(larger)
        : EmptyTreeNode<V>().insert(v).merge(smaller).merge(larger);
  }

  TreeNode<V> remove(V v) {
    final pieces = split(v),
        smaller = pieces.smaller,
        identical = pieces.identical,
        larger = pieces.larger;
    return identical is FHQTreapNode<V> && identical.weight > 1
        ? FHQTreapNode<V>(
                value: v,
                weight: identical.weight - 1,
                rank: identical.rank,
                left: EmptyTreeNode(),
                right: EmptyTreeNode())
            .merge(smaller)
            .merge(larger)
        : smaller.merge(larger);
  }

  bool contains(V v) => v.compareTo(value) == 0
      ? true
      : ((v.compareTo(value) < 0) ? left.contains(v) : right.contains(v));
  Iterable<FHQTreapNode<V>> inorder() sync* {
    for (final node in left.inorder()) yield node;
    yield this;
    for (final node in right.inorder()) yield node;
  }

  TreeNodePieces<V> split(V v) {
    if (v.compareTo(value) == 0)
      return TreeNodePieces<V>(
          smaller: left,
          identical: FHQTreapNode(
              value: v,
              left: EmptyTreeNode(),
              right: EmptyTreeNode(),
              weight: weight,
              rank: rank),
          larger: right);
    TreeNodePieces<V> pieces;
    TreeNode<V> nextSmaller, nextLarger, nextIdentical;
    if (v.compareTo(value) < 0) {
      pieces = left.split(v);
      nextSmaller = pieces.smaller;
      nextIdentical = pieces.identical;
      nextLarger = pieces.larger;
      return TreeNodePieces<V>(
          smaller: nextSmaller,
          identical: nextIdentical,
          larger: FHQTreapNode(
              value: value,
              left: nextLarger,
              weight: weight,
              right: right,
              rank: rank));
    } else {
      pieces = right.split(v);
      nextSmaller = pieces.smaller;
      nextIdentical = pieces.identical;
      nextLarger = pieces.larger;
      return TreeNodePieces<V>(
          smaller: FHQTreapNode(
              value: value,
              left: left,
              right: nextSmaller,
              weight: weight,
              rank: rank),
          identical: nextIdentical,
          larger: nextLarger);
    }
  }

  FHQTreapNode<V> merge(TreeNode<V> other) {
    if (other.isEmpty) return this;
    var smaller = other as FHQTreapNode<V>, larger = this;
    if (smaller.value.compareTo(larger.value) > 0) {
      final temp = smaller;
      smaller = larger;
      larger = temp;
    }
    return smaller.rank <= larger.rank
        ? FHQTreapNode(
            value: larger.value,
            left: smaller.merge(larger.left),
            weight: larger.weight,
            right: larger.right,
            rank: larger.rank)
        : FHQTreapNode(
            value: smaller.value,
            left: smaller.left,
            right: smaller.right.merge(larger),
            weight: smaller.weight,
            rank: smaller.rank);
  }

  FHQTreapNode(
      {required this.value,
      required this.left,
      required this.right,
      required this.weight,
      required this.rank})
      : size = weight + left.size + right.size;
}

class NodeData implements Comparable<NodeData> {
  int id;
  int hits;
  int key;
  int value;

  NodeData(
      {required this.key,
      required this.value,
      required this.hits,
      required this.id});

  @override
  compareTo(NodeData other) {
    return other.hits != hits
        ? hits.compareTo(other.hits)
        : (id != other.id ? id.compareTo(other.id) : key.compareTo(other.key));
  }
}

class LFUCache {
  static int increaseKey = 0;
  int capacity;
  Map<int, NodeData> map = {};
  TreeNode<NodeData> root = EmptyTreeNode();

  LFUCache(this.capacity);

  int get(int key) {
    var cachedNode = map[key];
    if (cachedNode == null) return -1;
    root = root.remove(cachedNode);
    cachedNode
      ..hits = cachedNode.hits + 1
      ..id = increaseKey++;
    root = root.insert(cachedNode);
    return cachedNode.value;
  }

  void put(int key, int value) {
    var cachedNode = map[key];
    if (cachedNode == null) {
      if (root.size == capacity && !root.isEmpty) {
        final min = root.minOrNull!;
        root = root.remove(min);
        map.remove(min.key);
      }
      cachedNode = NodeData(key: key, value: value, hits: 1, id: increaseKey++);
      root = root.insert(cachedNode);
      map[key] = cachedNode;
    } else {
      root = root.remove(cachedNode);
      cachedNode
        ..hits = cachedNode.hits + 1
        ..id = increaseKey++
        ..value = value;
      root = root.insert(cachedNode);
    }
  }
}
