module InitFromPath
  def initialize opts={}
    @path = opts[:path]
    @pwd = opts[:pwd]
    resolve_path if @pwd
  end

  def path_is_absolute?
    @path[0..0] == "/"
  end

  def resolve_path
    return @path if path_is_absolute?

    @pwd << "/" if @pwd[@pwd.length-1..@pwd.length-1] != "/"
    @path = @pwd + @path
  end
end